import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import siteConfig from '../config/site.config'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import SwitchLayout from '../components/SwitchLayout'
import { useEffect, useState } from 'react'
import { UploadingFile ,OdFolderChildren} from '../types'
import OptionGroup from '../components/OptionGroup'
import ProgressBtn from '../components/ProgressBtn'
import ProgressSlide from '../components/ProgressSlide'

export default function Home() {
  
  const [uploadingFiles, setUploadingFiles ] = useState(new Array<UploadingFile>)
  const [uploadedFiles, setUploadedFiles] = useState(new Array<OdFolderChildren>)
  const [slideOpen, setSlideOpen ] = useState(false)
  const [totalUploadFileNumber,setTotalUploadFileNumber] = useState(0)

  const optionGroupProps = {
    isOptionBtnShow:true,
    uploadingFiles,
    uploadedFiles,
    setUploadedFiles,
    setUploadingFiles,
    setSlideOpen,
    setTotalUploadFileNumber
  }
  const progressSlideProps = {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    totalUploadFileNumber,
    setTotalUploadFileNumber
  }

  const progressBtnProps = {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    totalUploadFileNumber
  }

  const fileListProps = {
    uploadedFiles,
    setUploadedFiles
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
