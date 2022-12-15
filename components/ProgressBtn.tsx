
import { Dispatch, SetStateAction } from "react"
import { UploadingFile } from "../types"
import { Button, Progress, Space } from 'antd';
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
      <Button className={(uploadingFiles.length === 0 ? 'hidden ' : '') + 'inline mr-2'} onClick={() => { setSlideOpen(!slideOpen) }} type='text' size ='small' icon={<Progress type="circle" width={17} percent={percent} className='items-center inline-block'  strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />}>
       
      </Button>
  )
}