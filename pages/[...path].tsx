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
import { extensions } from '../utils/getPreviewType'
import { useState } from 'react'
import { UploadingFile } from '../types'
import ProgressBtn from '../components/ProgressBtn'
import ProgressSlide from '../components/ProgressSlide'

const isPathDirectory =(path:string | string[] | undefined)=>{
  if(typeof (path) === "string" ){
    let pathPart = path.split('.')
    if(pathPart.length===1){

      return true
    }else{
      let isNotFile = true
      Object.keys(extensions).map(
        (key,index)=>{
          if(pathPart[pathPart.length-1] === key){
            isNotFile = false
          }
        }
      )

      return isNotFile
    }
  }else{
    console.log(path)

    return false
  }
}

export default function Folders() {
  const { query } = useRouter()
  let { path } = query
  let pathStr = typeof(path) !=="object"?path:path[path.length-1]
  let isOptionBtnShow = isPathDirectory(pathStr)?true:false

  const [uploadingFiles, setUploadingFiles ] = useState(new Array<UploadingFile>)
  const [uploadedFiles, setUploadedFiles] = useState(new Array)
  const [ slideOpen, setSlideOpen ] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <Head>o
        <title>{siteConfig.title}</title>
      </Head>
      
      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar />
        
        <ProgressSlide files={uploadingFiles} slideOpen={slideOpen} setSlideOpen={setSlideOpen} />
        <div className="mx-auto w-full max-w-5xl p-4">
          <nav className="mb-4 flex items-center justify-between space-x-3 pl-1">
            <Breadcrumb query={query} />
            <div className='flex'>
            <OptionGroup isShow={isOptionBtnShow} setUploadingFiles={setUploadingFiles} uploadingFiles={uploadingFiles} setSlideOpen={setSlideOpen}/>
            <ProgressBtn uploadingFiles={uploadingFiles} slideOpen={slideOpen} setSlideOpen={setSlideOpen}/>
            
            <SwitchLayout />
            </div>
          </nav>
          <FileListing query={query} />
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
