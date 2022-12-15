
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { OdFolderChildren, UploadingFile } from '../types'
import { formatBytes } from '../utils/formatBytes'
import LimitPromise from '../utils/LimitPromise'
import { useRouter } from 'next/router'
import { getStoredToken } from '../utils/protectedRouteHandler'
import { restrictedUpload } from '../utils/uploadFile'

import { DownOutlined, UploadOutlined, FolderAddOutlined, FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { useTranslation } from 'next-i18next'
import CreateFolderModal from './CreateFolderModal'
import { FloatButton } from 'antd';
import { CustomerServiceOutlined, CommentOutlined } from '@ant-design/icons';



const OptionGroup = ({
  isFolderPage,
  folderChildren,
  setFolderChildren,
  uploadingFiles,
  setUploadingFiles,
  setSlideOpen,
  uploadProgress,
  setUploadProgress
}: {
  isFolderPage: boolean
  folderChildren: Array<OdFolderChildren>
  setFolderChildren: Dispatch<SetStateAction<Array<OdFolderChildren>>>
  uploadingFiles:Array<UploadingFile>
  setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
  setSlideOpen: Dispatch<SetStateAction<boolean>>,
  uploadProgress:number
  setUploadProgress: Dispatch<SetStateAction<number>>
}) => {
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);
  const { asPath } = useRouter()
  const uploadInput = useRef<HTMLInputElement>(null)
  const hashedToken = getStoredToken(asPath)
  const totFileSize = useRef<number>(0)

  //limit the maximal number of uploading files to 6
  const limtReq = new LimitPromise(6);

  const { t } = useTranslation()

  useEffect(() =>{
    let waitingSize = 0
    if(uploadingFiles){
      uploadingFiles.map((uploadingfile)=>{
        //-1 means file upload error
        if(uploadingfile.percent!==-1){
          waitingSize = (100-uploadingfile.percent)/100*uploadingfile.size + waitingSize
        }
        //if upload failed, delete it from uploading
        if(uploadingfile.percent===-1){
          totFileSize.current = totFileSize.current - uploadingfile.size
        }
      })
      let totalPercent = Math.round((totFileSize.current-waitingSize)/totFileSize.current*100)
      setUploadProgress(totalPercent)
    }
    
  },[uploadingFiles])

 
  //upload file to onedrive
  const handleUploadFiles = (files: Array<File>) => {
    //calculate total uploaded files size
    if (uploadProgress===100){
      totFileSize.current = 0
    }
    files.map(
      (f) => {
        totFileSize.current = f.size + totFileSize.current
      }
    )
    let uploading = [...uploadingFiles]
    files.map((file: File,index:number) => {
      let isSameFileExisted = uploadingFiles.some((uploadingfile)=>{
        if(uploadingfile.name===file.name){
          return true
        }else{
          return false
        }
      })
      if(isSameFileExisted){
        files.splice(index,1)
      }else{
        uploading.push({
          name: file.name,
          percent: 0,
          sizeStr: formatBytes(file.size),
          size: file.size,
          status: 'uploading',
          session:'' 
        })
      }

      
    })
    setUploadingFiles(uploading)
    setSlideOpen(true)
    const uploaded: Array<OdFolderChildren> = [];
    files.map(async (file: File) => {
      restrictedUpload(file, asPath, hashedToken, limtReq, uploading, setUploadingFiles).then((data) => {

        uploaded.push(data as unknown as OdFolderChildren)
        //remove uploaded files from uploading list
        uploading.map((f, index) => {
          if (f.name === file.name) {
            uploading.splice(index, 1);
          }
        })
        let uploadingTemp = [...uploading]
        setUploadingFiles(uploadingTemp);
        let folder = [...folderChildren]
        setFolderChildren(folder.concat(uploaded))
      }).catch((err) => {
        console.log(err)
      })
    })
  }

  const handleFileEvent = (e: { target: { files: any } }) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files)
    handleUploadFiles(chosenFiles);
  }

  const createFolderModalProps = {
    openCreateFolderModal,
    setOpenCreateFolderModal,
    folderChildren,
    setFolderChildren,
  }


  return (
    <>
      <input type="file" ref={uploadInput} multiple className="hidden" onChange={handleFileEvent} />
      <CreateFolderModal {...createFolderModalProps} />
      <FloatButton.Group icon={<PlusOutlined className='inline-flex' />} type="primary" trigger="click" className={isFolderPage ? "inline-block float-right mr-4" : "hidden "}>

        <FloatButton tooltip={<div>{t('Create a folder')}</div>} icon={<FolderAddOutlined />} onClick={() => { setOpenCreateFolderModal(true) }} />
        <FloatButton tooltip={<div>{t('Upload files')}</div>} icon={<UploadOutlined />} onClick={() => {
          uploadInput.current?.click()
        }} />


      </FloatButton.Group>
    </>


  )
}

export default OptionGroup