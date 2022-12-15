import axios, { AxiosRequestConfig } from "axios";
import { Dispatch, SetStateAction } from "react";
import { UploadingFile } from "../types";
import LimitPromise from "./LimitPromise";

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

//slice file, as the onedrive api ,the picece size must can be devided by 5*256*256=327,680 Byte=327KB. 
// otherwise, if file size smaller than 60MB, it can be not necessary to be sliced.
//but considering the long wait time, I suggest slicing it.
//defaut pieceSize is almost 3,3 MB
//args: file:File object; pieceSize:Byte
//return chunks,[{'start':start,'end':end,'blob':blob}]
const sliceFile = (file:File, pieceSize = 5 * 256 * 256 * 30) => {
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


//upload file via upload url to onedrive
export const uploadFile = async (
  file:File,
  parentPath:string,
  odpt:string|null,
  uploadingFiles:Array<UploadingFile>,
  setUploadingFiles:Dispatch<SetStateAction<Array<UploadingFile>>>,) => {
  //get upload session
  let uploadUrl = await getUploadSession(file.name,parentPath,odpt)
  let pieceSize = 5 * 256 * 256 * 10
  let start = 0
  let percent = 0
  

  //update percent in uploading files
  const updatePercent = ()=>{
          
    //accordingto the usestate design,update percent,ui may not be updated
    //here add a new viariable and copy uploading files.
    //so usestate will believe this is a new state.
    //and ui can be updated.
    let uploadingTemp = [...uploadingFiles]
    uploadingTemp.map((f,index)=>{
      if(f.name === file.name){
        uploadingTemp[index].percent = percent
      }
      setUploadingFiles(uploadingTemp)
    })
  }

  //do not use map or forEach. they will do all loop at same time,
  //but chunks must be uploaded in order.
  // waiting for the response from onedrive server is neccessary.
  return new Promise((resolve, reject) => {
    let run  = async () => {
      if(uploadUrl == null){
        reject('get uploadurl failed.')
        return 
      }
      let chunks = sliceFile(file, pieceSize)
      try {
        let running = true

        while (running) {
          
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

            percent = Math.round(start/file.size*100)
            
            updatePercent()
            
          }
          //all upload done
          else if (res.status === 201) {
            percent = 100
            updatePercent()
            resolve(res.data)
            running = false
            
          }
          //file conflict
          else if (res.status === 409) {
            //if error, upload url need to be delete from onedrive server
            axios.delete(uploadUrl)
            percent = -1
            updatePercent()
            
            reject(file.name+': file name conflict. You upload two file with same name')
            running = false
            
          }

          
        }
      } catch (err) {
        axios.delete(uploadUrl)
        percent = -1
        updatePercent()
        reject(file.name+':upload failed, msg:'+err)
      }

    }
    run()
  })

}


//upload file, but limit the number of uploading files
export const restrictedUpload = (
  file:File,
  parentPath:string,
  odpt:string|null,
  limtReq:LimitPromise,
  uploadingFiles:Array<UploadingFile>,
  setUploadingFiles:Dispatch<SetStateAction<Array<UploadingFile>>>,
  resolve?: (value: any | PromiseLike<any>) => void,
  reject?: (reason?: any) => void
) =>
  limtReq
    .call(()=>uploadFile(file,parentPath,odpt,uploadingFiles,setUploadingFiles))
    .then(resolve)
    .catch(reject);
