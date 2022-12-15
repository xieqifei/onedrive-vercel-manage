
import { Dispatch, SetStateAction } from "react"
import { UploadingFile } from "../types"
import { Button, Progress } from 'antd';
import { useTranslation } from "next-i18next";

export default function ProgressBtn(
  {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    uploadProgress
  }: {
    uploadingFiles: Array<UploadingFile>
    slideOpen: boolean
    setSlideOpen: Dispatch<SetStateAction<boolean>>
    uploadProgress: number
  }
) {
  const { t } = useTranslation()

  return (
      <Button className={(uploadingFiles.length === 0 ? 'hidden ' : '') + 'inline mr-2'} onClick={() => { setSlideOpen(!slideOpen) }} type='text' size ='small' icon={<Progress type="circle" width={17} percent={uploadProgress} className='items-center inline-block'  strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />}>
       
      </Button>
  )
}