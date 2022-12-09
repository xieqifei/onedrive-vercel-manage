
import { Dispatch, SetStateAction } from "react"
import { UploadingFile } from "../types"
import {Circles } from 'react-loading-icons'

export default function ProgressBtn(
  {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
  }: {
    uploadingFiles: Array<UploadingFile>
    slideOpen: boolean
    setSlideOpen: Dispatch<SetStateAction<boolean>>
  }
) {
  return (
    <button className={uploadingFiles.length > 0 ? '' : 'hidden ' + "flex"} onClick={() => { setSlideOpen(!slideOpen) }}>
      <Circles height={'15'} width='20' speed='2' fill='#06bcee'/>
      <p className='inline '>{uploadingFiles.length}...</p>
      <p className='inline mr-1 hidden sm:inline'> Uploading</p>
    </button>
  )
}