import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import siteConfig from '../config/site.config'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import SwitchLayout from '../components/SwitchLayout'
import { useEffect, useRef, useState } from 'react'
import { UploadingFile ,OdFolderChildren} from '../types'
import OptionGroup from '../components/OptionGroup'
import ProgressBtn from '../components/ProgressBtn'
import ProgressSlide from '../components/ProgressSlide'

export default function Home() {
  
  const [uploadingFiles, setUploadingFiles ] = useState(new Array<UploadingFile>)
  const [slideOpen, setSlideOpen ] = useState(false)
  const [totalUploadFileSize,setTotalUploadFileSize] = useState(0)
  const [isOptionBtnShow,setIsOptionBtnShow] = useState(true)
  const [folderChildren,setFolderChildren] = useState(new Array<OdFolderChildren>)

  const optionGroupProps = {
    isOptionBtnShow,
    folderChildren,
    setFolderChildren,
    setUploadingFiles,
    setSlideOpen,
    setTotalUploadFileSize
  }
  const progressSlideProps = {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    totalUploadFileSize
  }

  const progressBtnProps = {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    totalUploadFileSize
  }

  const fileListProps = {
    folderChildren,
    setFolderChildren,
    setIsOptionBtnShow
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>
        <title>{siteConfig.title}</title>
      </Head>
      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <ProgressSlide {...progressSlideProps}/>

        <Navbar />
        

        <div className="mx-auto w-full max-w-5xl p-4">
          
          <nav className="mb-4 flex items-center justify-between pl-1">
          
            <Breadcrumb />
            <div className='flex'>
            <OptionGroup {...optionGroupProps}/>
            <ProgressBtn {...progressBtnProps}/>
            
            <SwitchLayout />
            </div>
          </nav>
          <FileListing {...fileListProps}/>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
