import { Dispatch, Fragment, SetStateAction } from 'react'
import { UploadingFile } from '../types'
import { Progress , Result, Drawer } from 'antd';
import { useTranslation } from 'next-i18next';

export default function ProgressSlide(
  {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    totalUploadFileSize
  }: {
    uploadingFiles: Array<UploadingFile>
    slideOpen: boolean
    setSlideOpen: Dispatch<SetStateAction<boolean>>
    totalUploadFileSize: number
  }
) {
  const {t} = useTranslation()


  let percent: number = 0
  if (totalUploadFileSize !== 0) {
    let finishedSize: number = 0
    uploadingFiles.map((f) => {
      finishedSize += f.size * f.percent / 100
    })
    percent = Math.round(finishedSize / totalUploadFileSize * 100)
  }

  const onClose = () => {
    setSlideOpen(false);
  };

  const ListItems = uploadingFiles.map((file: UploadingFile) => {
    return (
      <li className="pt-3 pb-0 sm:pt-4" key={file.name}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
              {file.name}
            </p>
            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
              File Size: {file.sizeStr}
            </p>
          </div>
          <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
            {file.percent}%
          </div>
        </div>
      </li>
    )
  })

  return (

    <Drawer title="Upload Progress" width='60%' placement="right" onClose={onClose} open={slideOpen}>
      <div className={uploadingFiles.length === 0 ? 'hidden ' : ''}>
          <div>
            <span> {
              t('Uploading: {{number}} file(s)',{number:uploadingFiles.length})
            } </span>
            <Progress percent={percent} size="small" />
          </div>

          {/* uploading file list */}
          <div className={"flow-root"}>
            <ul role="list" className="divide-y-1 divide-gray-200 dark:divide-gray-700">
              {ListItems}
            </ul>
          </div>
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