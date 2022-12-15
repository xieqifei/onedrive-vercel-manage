
import { Dispatch, SetStateAction, useRef, useState } from 'react'
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
  isOptionBtnShow,
  folderChildren,
  setFolderChildren,
  setUploadingFiles,
  setSlideOpen,
  setTotalUploadFileSize
}: {
  isOptionBtnShow: boolean
  folderChildren:Array<OdFolderChildren>
  setFolderChildren:Dispatch<SetStateAction<Array<OdFolderChildren>>>
  setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
  setSlideOpen: Dispatch<SetStateAction<boolean>>,
  setTotalUploadFileSize: Dispatch<SetStateAction<number>>
}) => {
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);
  const { asPath } = useRouter()
  const uploadInput = useRef<HTMLInputElement>(null)
  const hashedToken = getStoredToken(asPath)
  // const totFileSize = useRef<number>(0)

  //limit the maximal number of uploading files to 6
  const limtReq = new LimitPromise(6);
  const totFileSize = useRef(0)

  const { t } = useTranslation()
  //upload file to onedrive
  const handleUploadFiles = (files: Array<File>) => {
    //count total size of uploaded files
    totFileSize.current = 0
    files.map(
      (f) => {
        totFileSize.current += f.size
      }
    )
    setTotalUploadFileSize(totFileSize.current)


    let uploading = new Array<UploadingFile>
    files.map((file: File) => {
      uploading.push({
        name: file.name,
        percent: 0,
        sizeStr: formatBytes(file.size),
        size: file.size
      })
    })
    setUploadingFiles(uploading)
    setSlideOpen(true)
    const uploaded:Array<OdFolderChildren> = [];
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

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <>
          <CreateFolderModal {...createFolderModalProps} />
          <a
            onClick={() => { setOpenCreateFolderModal(true) }}
          >
            {t('Create a folder')}
          </a>
        </>

      ),
      icon: <FolderAddOutlined />
    },
    {
      key: '2',
      label: (<>
        <input type="file" ref={uploadInput} multiple className="hidden" onChange={handleFileEvent} />
        <a
          // onClick={() => setMenuOpen(true)}
          onClick={() => {
            uploadInput.current?.click()
          }}
        >
          {t('Upload files')}

        </a>
      </>
      ),
      icon: <UploadOutlined />,
    }

  ];

  return (
    <>
    <input type="file" ref={uploadInput} multiple className="hidden" onChange={handleFileEvent} />
    <CreateFolderModal {...createFolderModalProps} />
    <FloatButton.Group icon={<PlusOutlined className='inline-flex'/>} type="primary" trigger="click" className={isOptionBtnShow ? "inline-block float-right mr-4" : "hidden "}>
      
      <FloatButton tooltip={<div>{t('Create a folder')}</div>} icon={<FolderAddOutlined />} onClick={() => { setOpenCreateFolderModal(true) }}/>
      <FloatButton tooltip={<div>{t('Upload files')}</div>} icon={<UploadOutlined />} onClick={() => {
            uploadInput.current?.click()
          }}/>
      

    </FloatButton.Group>
    {/* <Dropdown menu={{ items }} trigger={['click']} className={isOptionBtnShow ? "inline-block float-right mr-4" : "hidden "}>
        <a onClick={(e) => e.preventDefault()}  >
          <Space className='hidden sm:flex'>
            <span className='inline'>{t('Add')}</span>
            <DownOutlined className="inline float-right" />
          </Space>
          <PlusOutlined className='sm:hidden ' />
        </a>
      </Dropdown> */}
    </>
    

  )
}

export default OptionGroup