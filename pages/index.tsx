import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import siteConfig from '../config/site.config'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import SwitchLayout from '../components/SwitchLayout'
import { useEffect, useRef, useState } from 'react'
import { UploadingFile, OdFolderChildren } from '../types'
import OptionGroup from '../components/OptionGroup'
import ProgressBtn from '../components/ProgressBtn'
import ProgressSlide from '../components/ProgressSlide'
import DeleteBtn from '../components/DeleteBtn'

export default function Home() {

  const [uploadingFiles, setUploadingFiles] = useState<Array<UploadingFile>>(new Array<UploadingFile>)
  const [slideOpen, setSlideOpen] = useState(false)
  const [isFolderPage, setIsFolderPage] = useState(false)
  const [folderChildren, setFolderChildren] = useState(new Array<OdFolderChildren>)
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({})
  const [uploadProgress,setUploadProgress] = useState<number>(0)

  const optionGroupProps = {
    isFolderPage,
    folderChildren,
    setFolderChildren,
    setUploadingFiles,
    setSlideOpen,
    setUploadProgress
  }

  const progressSlideProps = {
    uploadingFiles,
    setUploadingFiles,
    folderChildren,
    setFolderChildren,
    slideOpen,
    setSlideOpen,
    uploadProgress
  }

  const progressBtnProps = {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    uploadProgress
  }

  const fileListProps = {
    folderChildren,
    setFolderChildren,
    setIsFolderPage,
    selected,
    setSelected
  }
  const delBtnProps = {
    folderChildren,
    setFolderChildren,
    selected
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>
        <title>{siteConfig.title}</title>
      </Head>
      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <ProgressSlide {...progressSlideProps} />
        <OptionGroup {...optionGroupProps} />
        <Navbar />


        <div className="mx-auto w-full max-w-5xl p-4">

          <nav className="mb-4 flex items-center justify-between pl-1">

            <Breadcrumb />
            
            <div className='flex'>
              <DeleteBtn {...delBtnProps}/>
              
              <ProgressBtn {...progressBtnProps} />

              <SwitchLayout isFolderPage/>
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
