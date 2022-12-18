
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { OdFolderChildren, UploadingFile } from '../types'
import { formatBytes } from '../utils/formatBytes'
import LimitPromise from '../utils/LimitPromise'
import { useRouter } from 'next/router'
import { getStoredToken } from '../utils/protectedRouteHandler'
import { handleUploadFiles } from '../utils/uploadFile'

import { DownOutlined, UploadOutlined, FolderAddOutlined, FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';

import { useTranslation } from 'next-i18next'
import CreateFolderModal from './CreateFolderModal'
import { FloatButton } from 'antd';
import { clearPageAsyncChanged, setPageAsyncChanged } from '../utils/asyncChangedPage'



const OptionGroup = ({
  isFolderPage,
  folderChildren,
  setFolderChildren,
  setUploadingFiles,
  setSlideOpen,
  setUploadProgress
}: {
  isFolderPage: boolean
  folderChildren: Array<OdFolderChildren>
  setFolderChildren: Dispatch<SetStateAction<Array<OdFolderChildren>>>
  setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
  setSlideOpen: Dispatch<SetStateAction<boolean>>
  setUploadProgress: Dispatch<SetStateAction<number>>
}) => {
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);
  const { asPath } = useRouter()
  const uploadInput = useRef<HTMLInputElement>(null)
  const hashedToken = getStoredToken(asPath)
  

  const { t } = useTranslation()


 

  const handleFileEvent = (e: { target: { files: any } }) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files)
    setSlideOpen(true)
    setPageAsyncChanged()
    handleUploadFiles(
      chosenFiles,
      asPath,
      hashedToken,
      setUploadingFiles,
      folderChildren,
      setFolderChildren,
      setUploadProgress);
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