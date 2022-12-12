
import { Dispatch, SetStateAction } from "react"
import { UploadingFile } from "../types"
import { Progress, Space } from 'antd';
import { useTranslation } from "next-i18next";

export default function ProgressBtn(
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
  let percent: number = 0
  if (totalUploadFileSize !== 0) {
    let finishedSize: number = 0
    uploadingFiles.map((f) => {
      finishedSize += f.size * f.percent/100
    })
    percent = Math.round(finishedSize / totalUploadFileSize * 100)
  }
  const { t } = useTranslation()

  return (
    <div className={(uploadingFiles.length === 0 ? 'hidden ' : '') + 'float-right mr-2'}>
      {/* <div className={'inline-block '+'float-right mr-4'}> */}
      <button className={"relative w-auto flex-shrink-0 inset-y-0  text-sm text-gray-600 dark:text-gray-300 grid grid-cols-1 md:grid-cols-6"} onClick={() => { setSlideOpen(!slideOpen) }}>
        
        <Progress type="circle" width={20} percent={percent} className='col-span-1 ' strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
        
        <p className="hidden md:col-span-5 md:grid">{t('Uploading')}...</p>
      </button>
    </div>

  )
}