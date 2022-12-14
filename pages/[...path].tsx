import Head from 'next/head'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import siteConfig from '../config/site.config'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import SwitchLayout from '../components/SwitchLayout'
import OptionGroup from '../components/OptionGroup'
import {  useState } from 'react'
import { OdFolderChildren, UploadingFile } from '../types'
import ProgressBtn from '../components/ProgressBtn'
import ProgressSlide from '../components/ProgressSlide'


export default function Folders() {
  const { query } = useRouter()

  const [uploadingFiles, setUploadingFiles ] = useState(new Array<UploadingFile>)
  const [slideOpen, setSlideOpen ] = useState(false)
  const [totalUploadFileSize,setTotalUploadFileSize] = useState(0)
  const [isOptionBtnShow,setIsOptionBtnShow] = useState(true)
  const [folderChildren,setFolderChildren] = useState<Array<OdFolderChildren>>(new Array<OdFolderChildren>)
  const [isDeleteBtnShow,setIsDeleteBtnShow] = useState(false)

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
    setIsOptionBtnShow,
    query
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>o
        <title>{siteConfig.title}</title>
      </Head>
      
      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />
        
        <ProgressSlide {...progressSlideProps} />
        <div className="mx-auto w-full max-w-5xl p-4">
          <nav className="mb-4 flex items-center justify-between space-x-3 pl-1">
            <Breadcrumb query={query} />
            <div className='flex'>
            <OptionGroup {...optionGroupProps}/>
            <ProgressBtn {...progressBtnProps}/>
            
            <SwitchLayout />
            </div>
          </nav>
          <FileListing {...fileListProps} />
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
