import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import siteConfig from '../config/site.config'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import SwitchLayout from '../components/SwitchLayout'
import { useState } from 'react'
import { UploadingFile } from '../types'
import OptionGroup from '../components/OptionGroup'
import ProgressBtn from '../components/ProgressBtn'
import ProgressSlide from '../components/ProgressSlide'

export default function Home() {

  const [uploadingFiles, setUploadingFiles ] = useState(new Array<UploadingFile>)
  const [uploadedFiles, setUploadedFiles] = useState(new Array)
  const [ slideOpen, setSlideOpen ] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>
        <title>{siteConfig.title}</title>
      </Head>

      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />
        <ProgressSlide files={uploadingFiles} slideOpen={slideOpen} setSlideOpen={setSlideOpen} />

        <div className="mx-auto w-full max-w-5xl p-4">
          <nav className="mb-4 flex items-center justify-between pl-1">
            <Breadcrumb />
            <div className='flex'>
            <OptionGroup isShow={true} setUploadingFiles={setUploadingFiles} uploadingFiles={uploadingFiles} setSlideOpen={setSlideOpen}/>
            <ProgressBtn uploadingFiles={uploadingFiles} slideOpen={slideOpen} setSlideOpen={setSlideOpen}/>
            
            <SwitchLayout />
            </div>
          </nav>
          <FileListing />
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
