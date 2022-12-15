import { Dispatch, Fragment, SetStateAction } from 'react'
import { UploadingFile } from '../types'
import { Progress, Result, Drawer, List, Avatar, Button } from 'antd';
import { useTranslation } from 'next-i18next';
import { RedoOutlined, PauseOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { reuploadFile } from '../utils/uploadFile';
import axios from 'axios';

export default function ProgressSlide(
  {
    uploadingFiles,
    setUploadingFiles,
    slideOpen,
    setSlideOpen,
    uploadProgress
  }: {
    uploadingFiles: Array<UploadingFile>
    setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
    slideOpen: boolean
    setSlideOpen: Dispatch<SetStateAction<boolean>>
    uploadProgress: number
  }
) {
  const { t } = useTranslation()

  const pauseUpload = (item: UploadingFile) => {
    let uploadingFilesTemp = [...uploadingFiles]
    uploadingFilesTemp.map((f, index) => {
      if (f.name === item.name) {
        uploadingFilesTemp[index].status = 'paused'
      }
    })
    setUploadingFiles(uploadingFilesTemp)
  }

  const removeUpload = (item: UploadingFile) => {
    let uploadingFilesTemp = [...uploadingFiles]
    uploadingFilesTemp.map((f, index) => {
      if (f.name === item.name) {
        uploadingFilesTemp.splice(index, 1)
        axios.delete(f.session)
      }
    })
    setUploadingFiles(uploadingFilesTemp)
  }

  const reupload = (item: UploadingFile) => {
    reuploadFile(item, uploadingFiles, setUploadingFiles)
  }

  const onClose = () => {
    setSlideOpen(false);
  };


  return (

    <Drawer title={t("Upload Progress")} width='60%' placement="right" onClose={onClose} open={slideOpen} >
      <div className={uploadingFiles.length === 0 ? 'hidden ' : ''}>
        <div>
          <span> {
            t('Uploading: {{number}} file(s)', { number: uploadingFiles.length })
          } </span>
          <Progress percent={uploadProgress} size="small" />
        </div>

        {/* uploading file list */}
        <List
          size='small'
          itemLayout="horizontal"
          dataSource={uploadingFiles}
          renderItem={(item) => (
            <List.Item style={{ padding: 0 }}>
              <div className='w-full '>
                <div className='w-4/5'>
                  <h4 className="truncate font-bold">{item.name}</h4>
                  <div className="inline-flex">
                    <div className='hidden sm:flex mr-5 '>{t('File size') + ':' + item.sizeStr}</div>
                    <div className={item.status === 'error' ? 'hidden' : ''}>{item.percent}%</div>
                    <div className={item.status === 'error' ? 'text-red-500' : 'hidden'}>Error</div>
                  </div>
                </div>
                <div className='mr-0'>

                  <Button onClick={() => { reupload(item) }} className={item.status !== 'uploading' ? '' : 'hidden'} shape="circle" size='small' icon={item.status === 'error' ? <RedoOutlined /> : <PlayCircleOutlined />} type="text"></Button>
                  <Button onClick={() => { pauseUpload(item) }} className={item.status === 'uploading' ? '' : 'hidden'} shape="circle" size='small' icon={<PauseOutlined />} type="text"></Button>
                  <Button onClick={() => { removeUpload(item) }} shape="circle" size='small' icon={<DeleteOutlined />} type="text" danger></Button>
                </div>
              </div>

            </List.Item>
          )}
        />

      </div>
      <div className={uploadingFiles.length > 0 ? 'hidden' : 'inline'}>
        <Result
          status="success"
          title={t('Successfully Upload All Files!')}
        />
      </div>
    </Drawer>


  )
}