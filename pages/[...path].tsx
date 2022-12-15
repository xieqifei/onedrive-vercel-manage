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
import { useState } from 'react'
import { OdFolderChildren, UploadingFile } from '../types'
import ProgressBtn from '../components/ProgressBtn'
import ProgressSlide from '../components/ProgressSlide'
import DeleteBtn from '../components/DeleteBtn'


export default function Folders() {
  const { query } = useRouter()

  const [uploadingFiles, setUploadingFiles] = useState(new Array<UploadingFile>)
  const [slideOpen, setSlideOpen] = useState(false)
  const [totalUploadFileSize, setTotalUploadFileSize] = useState(0)
  const [isFolderPage, setIsFolderPage] = useState(true)
  const [folderChildren, setFolderChildren] = useState<Array<OdFolderChildren>>(new Array<OdFolderChildren>)
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({})
  const [uploadProgress,setUploadProgress] = useState<number>(0)


  const optionGroupProps = {
    isFolderPage,
    folderChildren,
    setFolderChildren,
    uploadingFiles,
    setUploadingFiles,
    setSlideOpen,
    uploadProgress,
    setUploadProgress
  }
  const progressSlideProps = {
    uploadingFiles,
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
    query,
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
      <Head>o
        <title>{siteConfig.title}</title>
      </Head>

      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />
        <OptionGroup {...optionGroupProps} />
        <ProgressSlide {...progressSlideProps} />
        <div className="mx-auto w-full max-w-5xl p-4">
          <nav className="mb-4 flex items-center justify-between space-x-3 pl-1">
            <Breadcrumb query={query} />
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
