import { Dispatch,  SetStateAction } from 'react'
import { OdFolderChildren, UploadingFile } from '../types'
import { Progress, Result, Drawer, List, Avatar, Button } from 'antd';
import { useTranslation } from 'next-i18next';
import { RedoOutlined, PauseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { pauseUpload, removeUpload, reuploadFile } from '../utils/uploadFile';


export default function ProgressSlide(
  {
    uploadingFiles,
    setUploadingFiles,
    folderChildren,
    setFolderChildren,
    slideOpen,
    setSlideOpen,
    uploadProgress
  }: {
    uploadingFiles: Array<UploadingFile>
    setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
    folderChildren: Array<OdFolderChildren>
    setFolderChildren: Dispatch<SetStateAction<Array<OdFolderChildren>>>
    slideOpen: boolean
    setSlideOpen: Dispatch<SetStateAction<boolean>>
    uploadProgress: number
  }
) {
  const { t } = useTranslation()

  const pauseUploadHandle = (item: UploadingFile) => {
    pauseUpload(item)
  }

  const removeUploadHandle = (item: UploadingFile) => {
    removeUpload(item)
  }

  const reupload = (item: UploadingFile) => {
    reuploadFile(item)
  }

  const onClose = () => {
    setSlideOpen(false);
  };


  return (

    <Drawer title={t("Upload Progress")} width='60%' placement="right" onClose={onClose} open={slideOpen} >
      <div className={uploadingFiles.every(f=>f.status==='done'||f.status==='removed') ? 'hidden ' : ''}>
        <div>
          <span> {
            t('Uploading: {{number}} file(s)', { number: uploadingFiles.filter(f=>f.status=='uploading').length })
          } </span>
          <Progress percent={uploadProgress} size="small" />
        </div>

        {/* uploading file list */}
        <List
          size='small'
          itemLayout="horizontal"
          dataSource={uploadingFiles.filter((f)=>f.status!=='removed'&&f.status!=='done')}
          renderItem={(item) => (
            <List.Item style={{ padding: 0 }}>
              <div className='w-full inline-flex'>
                <div className='w-4/5'>
                  <h4 className="truncate font-bold">{item.name}</h4>
                  <div className="inline-flex">
                    <div className='hidden sm:flex mr-5 '>{t('File size') + ':' + item.sizeStr}</div>
                    <div className={item.status === 'error' ? 'hidden' : ''}>{item.percent}%</div>
                    <div className={item.status === 'error' ? 'text-red-500' : 'hidden'}>Error</div>
                  </div>
                </div>
                <div className='mr-0 inline-flex'>
                  <Button onClick={() => { reupload(item) }} className={item.status !== 'uploading' ? '' : 'hidden'} shape="circle" size='small' icon={item.status === 'error' ? <RedoOutlined /> : <PlayCircleOutlined />} type="text"></Button>
                  <Button onClick={() => { pauseUploadHandle(item) }} className={item.status === 'uploading' ? '' : 'hidden'} shape="circle" size='small' icon={<PauseOutlined />} type="text"></Button>
                  <Button onClick={() => { removeUploadHandle(item) }} shape="circle" size='small' icon={<DeleteOutlined />} type="text" danger></Button>
                </div>
              </div>

            </List.Item>
          )}
        />

      </div>
      <div className={!uploadingFiles.every(f=>f.status==='done'||f.status==='removed')||uploadingFiles.length===0? 'hidden' : 'inline'}>
        <Result
          status="success"
          title={t('Successfully Upload All Files!')}
        />
      </div>
    </Drawer>


  )
}