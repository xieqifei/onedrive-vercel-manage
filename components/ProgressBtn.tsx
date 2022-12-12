
import { Dispatch, SetStateAction } from "react"
import { UploadingFile } from "../types"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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


  return (
    <div className={uploadingFiles.length === 0 ? 'hidden ' : 'inline-block ' + 'float-right mr-4'}>
      {/* <div className={'inline-block '+'float-right mr-4'}> */}
      <button className={"relative w-auto flex-shrink-0 text-sm text-gray-600 dark:text-gray-300 grid grid-cols-1 md:grid-cols-6"} onClick={() => { setSlideOpen(!slideOpen) }}>
        {/* <Circles className="col-span-1" height={'18'} width='18' speed='2' fill='#06bcee'/> */}
        <div style={{ width: 18, height: 18 }} className='col-span-1'>
          <CircularProgressbar value={percent} />
        </div>
        <p className="hidden md:col-span-5 md:grid">Uploading...</p>
      </button>
    </div>

  )
}