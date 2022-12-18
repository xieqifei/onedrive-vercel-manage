import { OdFolderChildren } from "../types"
import { Button } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { useTranslation } from "next-i18next";
import router, { useRouter } from "next/router";
import { getStoredToken } from "../utils/protectedRouteHandler";
import { DownloadingToast, downloadMultipleFiles, downloadTreelikeMultipleFiles, traverseFolder } from "./MultiFileDownloader";
import toast from "react-hot-toast";
import { ParsedUrlQuery } from "querystring";
/**
 * Convert url query into path string
 *
 * @param query Url query property
 * @returns Path string
 */
const queryToPath = (query?: ParsedUrlQuery) => {
    if (query) {
      const { path } = query
      if (!path) return '/'
      if (typeof path === 'string') return `/${encodeURIComponent(path)}`
      return `/${path.map(p => encodeURIComponent(p)).join('/')}`
    }
    return '/'
  }

const SelectedDownloadBtn = ({
  folderChildren,
  selected }: {
    folderChildren: Array<OdFolderChildren>,
    selected: { [key: string]: boolean }
  }
) => {
  const { query } = useRouter()
  const path = queryToPath(query)
  const { t } = useTranslation()
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)


  let isDLBtnShow = false
  
  const isSingleFolderSelected = (()=>{
    let tureCount = Object.values(selected).filter(v=>v===true).length
    if(tureCount>=2||tureCount===0){
        return false
    }else{
        let isOnlyFolder = false
        Object.keys(selected).map((id)=>{
            if(selected[id]===true){
                folderChildren.map(f=>{
                    if(f.id===id&&f.folder){
                        isOnlyFolder=true 
                    }
                })
            }
        })
        return isOnlyFolder
    }
  })()

  const isOnlyFilesSelected = (()=>{
    if(Object.values(selected).filter(v=>v===true).length===0){
        return false
    }
    return !(folderChildren.some(f=>f.folder&&selected[f.id]))
  })()

  isDLBtnShow = isOnlyFilesSelected||isSingleFolderSelected

   // Selected file download
   const handleSelectedFilesDownload = () => {
    const folderName = path.substring(path.lastIndexOf('/') + 1)
    const folder = folderName ? decodeURIComponent(folderName) : undefined
    const files = folderChildren
      .filter(c => selected[c.id])
      .map(c => ({
        name: c.name,
        url: `/api/raw/?path=${path}/${encodeURIComponent(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`,
      }))

    if (files.length == 1) {
      const el = document.createElement('a')
      el.style.display = 'none'
      document.body.appendChild(el)
      el.href = files[0].url
      el.click()
      el.remove()
    } else if (files.length > 1) {

      const toastId = toast.loading(<DownloadingToast router={router} />)
      downloadMultipleFiles({ toastId, router, files, folder })
        .then(() => {
          toast.success(t('Finished downloading selected files.'), {
            id: toastId,
          })
        })
        .catch(() => {
          toast.error(t('Failed to download selected files.'), { id: toastId })
        })
    }
  }

 // Folder recursive download
 const handleFolderDownload = (path: string, name?: string) => {
    console.log('hanlde')
    const files = (async function* () {
      for await (const { meta: c, path: p, isFolder, error } of traverseFolder(path)) {
        if (error) {
          toast.error(
            t('Failed to download folder {{path}}: {{status}} {{message}} Skipped it to continue.', {
              path: p,
              status: error.status,
              message: error.message,
            })
          )
          continue
        }
        const hashedTokenForPath = getStoredToken(p)
        yield {
          name: c?.name,
          url: `/api/raw/?path=${p}${hashedTokenForPath ? `&odpt=${hashedTokenForPath}` : ''}`,
          path: p,
          isFolder,
        }
      }
    })()
    console.log('22')
    const toastId = toast.loading(<DownloadingToast router={router} />)
    console.log('555')


    downloadTreelikeMultipleFiles({
      toastId,
      router,
      files,
      basePath: path,
      folder: name,
    })
      .then(() => {
        toast.success(t('Finished downloading folder.'), { id: toastId })
      })
      .catch(() => {
        toast.error(t('Failed to download folder.'), { id: toastId })
      })
  }

  
  const handleSelectedDownload = ()=>{
    if(isOnlyFilesSelected){
        handleSelectedFilesDownload()
    }else{
        try {
            let id = Object.keys(selected).find(key=>selected[key]===true) as string
            let name = folderChildren.find(f=>f.id===id)?.name as string
            const p = `${path === '/' ? '' : path}/${encodeURIComponent(name)}`
            console.log(p,id,name)
            handleFolderDownload(p,name)
            console.log('aaa')
        } catch (error) {
            console.log('download folder error')
        }
    }
  }


  return (
    <Button
        icon={<CloudDownloadOutlined  style={{ display: 'inline-flex' }} />}
        onClick={() => { handleSelectedDownload() }}
        className={isDLBtnShow? 'mr-2 content-center' : 'hidden'}
        size='small'
        style={{color: 'rgb(14 165 233)',borderColor: '#2196F3'}}
    >
        <span >{t('Download')}</span>
    </Button>

  )
}

export default SelectedDownloadBtn