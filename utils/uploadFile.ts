import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { OdFolderChildren, UploadingFile } from "../types";
import { formatBytes } from "./formatBytes";
import LimitPromise from "./LimitPromise";

const uploadingFilesConst = new Array<UploadingFile>
let setUploadProgressConst: Dispatch<SetStateAction<number>>
let setUploadingFilesConst: Dispatch<SetStateAction<Array<UploadingFile>>>
let folderChildrenConst = new Array<OdFolderChildren>
let setFolderChildrenConst: Dispatch<SetStateAction<Array<OdFolderChildren>>>

//limit the maximal number of uploading files to 6
const limtReq = new LimitPromise(6);

const refreshUploadingFiles = () => {
  let uploadingFilesTemp = [...uploadingFilesConst]
  setUploadingFilesConst(uploadingFilesTemp)
}
//get uploadsession via upload api
const getUploadSession = async (filename: string, parentPath: string, odpt: string | null) => {
  const res = await axios.get(`/api/upload/?path=${parentPath}&filename=${filename}${odpt ? `&odpt=${odpt}` : ''}`)
  if (res.status === 200) {
    const { uploadUrl } = res.data

    return uploadUrl
  } else {
    console.warn(res.data)
    return null
  }
}

const updateTotProgress = () => {
  let waitingSize = 0
  let totalSize = 0
  if (uploadingFilesConst) {
    uploadingFilesConst.map((uploadingfile) => {
      //-1 means file upload error
      if (uploadingfile.status !== 'removed') {
        waitingSize = (100 - uploadingfile.percent) / 100 * uploadingfile.size + waitingSize
        totalSize = uploadingfile.size + totalSize
      }
    })
    let totalPercent = Math.round((totalSize - waitingSize) / totalSize * 100)
    setUploadProgressConst(totalPercent)
  }
}

const getFileStatus = (isUploadDone: boolean, file: File) => {
  updateTotProgress()
  let statusTemp: 'done' | 'uploading' | 'paused' | 'error' | 'removed' = 'error'
  if (!isUploadDone) {
    uploadingFilesConst.map(f => {
      if (f.name === file.name) {
        //if status is paused or error, store file into pausedFiles
        if (f.status === 'paused' || f.status === 'error') {
          push2PausedFiles(file)
        }
        statusTemp = f.status
      }
    })
    return statusTemp as 'done' | 'uploading' | 'paused' | 'error' | 'removed'
  } else {
    return 'error'
  }

}

//delete uploadingFile
export const removeUpload = (
  item: UploadingFile) => {
  uploadingFilesConst.map((f, index) => {
    if (f.name === item.name) {
      uploadingFilesConst[index].status = 'removed'
      axios.delete(uploadingFilesConst[index].session)
    }
  })
  refreshUploadingFiles()
}

export const pauseUpload = (
  item: UploadingFile
) => {
  uploadingFilesConst.map((f, index) => {
    if (f.name === item.name) {
      uploadingFilesConst[index].status = 'paused'
    }
  })
  refreshUploadingFiles()
}

//add uploaded file to folderChildren, so that this will be added into page ui
const add2FolderChildren = (
  item: OdFolderChildren) => {
  folderChildrenConst.push(item)
  let folderChildrenTemp = [...folderChildrenConst]
  setFolderChildrenConst(folderChildrenTemp)
}

//slice file, as the onedrive api ,the picece size must can be devided by 5*256*256=327,680 Byte=327KB. 
// otherwise, if file size smaller than 60MB, it can be not necessary to be sliced.
//but considering the long wait time, I suggest slicing it.
//defaut pieceSize is almost 3,3 MB
//args: file:File object; pieceSize:Byte
//return chunks,[{'start':start,'end':end,'blob':blob}]
const sliceFile = (file: File, pieceSize = 5 * 256 * 256 * 30) => {
  let totalSize = file.size; //total size of file
  let start = 0; // start byte
  let end = start + pieceSize; // end byte
  if (end > file.size) {
    end = file.size
  }
  let chunks: {}[] = new Array()
  while (start < totalSize) {
    // slice the length 
    // File inhert Blob, so it can use slice function.
    let blob = file.slice(start, end);
    chunks.push({ 'start': start, 'end': end - 1, 'blob': blob })
    start = end;
    end = start + pieceSize;
    if (end > file.size) {
      end = file.size
    }
  }
  return chunks
}

const pausedFiles = new Array<File>
const push2PausedFiles = (file: File) => {
  let isSameFile = pausedFiles.some((f) => {
    if (f.name === file.name) {
      return true
    }
  })
  if (!isSameFile) {
    pausedFiles.push(file)
  }
}

//update percent in uploading files
const updateUploadingFiles = (
  percent: number,
  file: File,
  status?: 'done' | 'uploading' | 'paused' | 'error' | 'removed',

) => {
  //accordingto the usestate design,update percent,ui may not be updated
  //here add a new viariable and copy uploading files.
  //so usestate will believe this is a new state.
  //and ui can be updated.
  uploadingFilesConst.map((f, index) => {
    if (f.name === file.name) {
      uploadingFilesConst[index].percent = percent
      if (status) {
        uploadingFilesConst[index].status = status
      }
    }

    refreshUploadingFiles()
  })
}



//breakpoint retransmission
export const reuploadFile = async (
  readyFile: UploadingFile) => {
  //get start byte number
  const uploadUrl = readyFile.session
  const rep = await axios.get(uploadUrl)
  const setStatus = (status: 'done' | 'uploading' | 'paused' | 'error' | 'removed') => {
    uploadingFilesConst.map((f, index) => {
      if (f.name === readyFile.name) {
        uploadingFilesConst[index].status = status
      }
    })
    refreshUploadingFiles()
  }

  if (rep.status !== 200) {
    console.log('do not get start byte')
    //if dont get start byte number set status error and end upload
    setStatus('error')
    return
  }

  const file = pausedFiles.find(f => f.name === readyFile.name)
  if (!file) {
    console.error('file not found.')
    setStatus('error')
    return
  }

  //set status to 'uploading'
  setStatus('uploading')
  //delete the uploading file from pausedFiles
  pausedFiles.splice(pausedFiles.indexOf(file), 1)

  let { nextExpectedRanges } = rep.data
  let pieceSize = 5 * 256 * 256 * 10
  let start = parseInt(nextExpectedRanges[0].split('-')[0])
  let percent = 0
  //use to control the loop, stop loop if upload done
  let isUploadDone = false

  const updateUploadingFilesT = (
    percent: number,
    status?: 'done' | 'uploading' | 'paused' | 'error' | 'removed',) => {
    updateUploadingFiles(percent, file, status)
  }



  return new Promise((resolve, reject) => {
    let run = async () => {
      try {
        let chunks = sliceFile(file, pieceSize)
        while (getFileStatus(isUploadDone, file) === 'uploading') {

          let chunk = chunks[start / pieceSize]
          let reqConfig = {
            headers: {
              // 'Content-Length': file.size,
              'Content-Range': `bytes ${chunk['start']}-${chunk['end']}/${file.size}`
            }
          }
          //DO NOT use access token here.
          let res = await axios.put(uploadUrl, chunk['blob'], reqConfig)
          // res.status is 202, last chunk upload success
          //get next range and redict
          if (res.status === 202) {
            let { nextExpectedRanges } = res.data
            // "nextExpectedRanges": [
            //   "12345-55232",
            //   "77829-99375"
            //   ]
            start = parseInt(nextExpectedRanges[0].split('-')[0])
            percent = Math.round(start / file.size * 100)
            updateUploadingFilesT(percent)
            isUploadDone = false
          }
          //all upload done
          else if (res.status === 201) {
            percent = 100
            updateUploadingFilesT(percent, 'done')
            add2FolderChildren(res.data)
            resolve(res.data)
            isUploadDone = true
          }
          //file conflict
          else if (res.status === 409) {
            //if error, upload url need to be delete from onedrive server
            push2PausedFiles(file)
            percent = -1
            updateUploadingFilesT(percent, 'error')
            isUploadDone = true
            reject(file.name + ': file name conflict. You upload two file with same name')
          }

        }
      } catch (err) {
        percent = -1
        push2PausedFiles(file)
        updateUploadingFilesT(percent, 'error')
        reject(file.name + ':upload failed, msg:' + err)
      }
    }
    run()
  })



}

//upload file via upload url to onedrive
export const uploadFile = async (
  file: File,
  parentPath: string,
  odpt: string | null,
) => {


  //if all files in uploadingFiles are removed or done, then clear uploadingFiles
  let isAllFilesRemovedOrDone = uploadingFilesConst.every((f) => {
    if (f.status === 'done' || f.status === 'removed') {
      return true
    }
  })

  if (isAllFilesRemovedOrDone) {
    uploadingFilesConst.splice(0, uploadingFilesConst.length)
  }
  let uploadUrl = await getUploadSession(file.name, parentPath, odpt)
  //store session url in uploadingFiles
  uploadingFilesConst.map((f, index) => {
    if (f.name === file.name) {
      uploadingFilesConst[index].session = uploadUrl
    }
  })
  refreshUploadingFiles()

  let pieceSize = 5 * 256 * 256 * 10
  let start = 0
  let percent = 0
  //use to control the loop
  let isUploadDone = false

  //update percent and status
  const updateUploadingFilesT = (
    percent: number,
    status?: 'done' | 'uploading' | 'paused' | 'error' | 'removed',) => {
    updateUploadingFiles(percent, file, status)
  }


  //do not use map or forEach. they will do all loop at same time,
  //but chunks must be uploaded in order.
  // waiting for the response from onedrive server is neccessary.
  return new Promise((resolve, reject) => {
    let run = async () => {
      if (uploadUrl == null) {
        reject('get uploadurl failed.')
        return
      }

      let chunks = sliceFile(file, pieceSize)
      try {
        while (getFileStatus(isUploadDone, file) === 'uploading') {
          let chunk = chunks[start / pieceSize]
          let reqConfig = {
            headers: {
              // 'Content-Length': file.size,
              'Content-Range': `bytes ${chunk['start']}-${chunk['end']}/${file.size}`
            }
          }

          //DO NOT use access token here.
          let res = await axios.put(uploadUrl, chunk['blob'], reqConfig)

          // res.status is 202, last chunk upload success
          //get next range and redict
          if (res.status === 202) {
            let { nextExpectedRanges } = res.data
            // "nextExpectedRanges": [
            //   "12345-55232",
            //   "77829-99375"
            //   ]
            start = parseInt(nextExpectedRanges[0].split('-')[0])
            percent = Math.round(start / file.size * 100)

            updateUploadingFilesT(percent)
            isUploadDone = false
          }
          //all upload done
          else if (res.status === 201) {

            percent = 100
            updateUploadingFilesT(percent, 'done')
            add2FolderChildren(res.data)
            resolve(res.data)
            isUploadDone = true
          }
          //file conflict
          else if (res.status === 409) {

            //if error, upload url need to be delete from onedrive server
            push2PausedFiles(file)
            percent = -1
            updateUploadingFilesT(percent, 'error')
            isUploadDone = true
            reject(file.name + ': file name conflict. You upload two file with same name')
          }

        }
      } catch (err) {
        percent = -1
        push2PausedFiles(file)
        updateUploadingFilesT(percent, 'error')
        reject(file.name + ':upload failed, msg:' + err)
      }

    }
    run()
  })

}


//upload file, but limit the number of uploading files
export const restrictedUpload = (
  file: File,
  parentPath: string,
  odpt: string | null,
  resolve?: (value: any | PromiseLike<any>) => void,
  reject?: (reason?: any) => void
) =>
  limtReq
    .call(() => uploadFile(
      file,
      parentPath,
      odpt,
    ))
    .then(resolve)
    .catch(reject);


//upload file to onedrive
export const handleUploadFiles = (
  files: Array<File>,
  asPath: string,
  hashedToken: string | null,
  setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>,
  folderChildren: Array<OdFolderChildren>,
  setFolderChildren: Dispatch<SetStateAction<Array<OdFolderChildren>>>,
  setUploadProgress: Dispatch<SetStateAction<number>>,
) => {

  //store states as local viriables or const
  setUploadProgressConst = setUploadProgress
  setUploadingFilesConst = setUploadingFiles
  setFolderChildrenConst = setFolderChildren
  //store folderchildren to folderchildrenconst
  folderChildren.map((f) => {
    if (!folderChildrenConst.some(fc => f.name === fc.name)) {
      folderChildrenConst.push(f)
    }
  })

  files.map((file: File, index: number) => {
    let isSameFileNotRemoved = uploadingFilesConst.some((uploadingfile) => {
      if (uploadingfile.name === file.name && uploadingfile.status !== 'removed') {
        return true
      }
      else {
        return false
      }
    })

    let isSameFileRemoved = uploadingFilesConst.some((uploadingfile) => {
      if (uploadingfile.name === file.name && uploadingfile.status === 'removed') {
        return true
      } else {
        return false
      }
    })
    if (isSameFileNotRemoved) {

      files.splice(index, 1)
    } else if (isSameFileRemoved) {
      uploadingFilesConst.map((f,i)=>{
        if(f.name === file.name){
          uploadingFilesConst[i].status = 'uploading'
          uploadingFilesConst[i].percent = 0
          refreshUploadingFiles()
        }
      })
      
    } else {
      uploadingFilesConst.push({
        name: file.name,
        percent: 0,
        sizeStr: formatBytes(file.size),
        size: file.size,
        status: 'uploading',
        session: ''
      })
    }
  })


  files.map(async (file: File) => {
    restrictedUpload(
      file,
      asPath,
      hashedToken,
    ).then((data) => {
      console.log('upload success')
    }).catch((err) => {
      console.log(err)
    })
  })
}