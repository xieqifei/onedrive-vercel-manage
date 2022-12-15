import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import apiConfig, { driveApi, cacheControlHeader } from '../../config/api.config'
import {  getAccessToken, checkAuthRoute, rawPath, encodePath } from '.'
import { posix as pathPosix } from 'path'
import { OdFolderObject } from '../../types'

//is every id in folderchildrenData?
const isIDsInFolderChildren = (itemids:[string],folderChildrenData:OdFolderObject)=>{
    return itemids.every((id)=>{
        return folderChildrenData.value.some((item)=>{
            if(item.id === id){
                return true
            }
        })
    })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST'){
        res.status(405).json({'msg':'Check request method'}) 
        return
    }
    // Get access token from storage
    const accessToken = await getAccessToken()
    const { path = '', itemids= [], odpt = '' } = req.body
    // Set edge function caching for faster load times, check docs:
    // https://vercel.com/docs/concepts/functions/edge-caching
    res.setHeader('Cache-Control', cacheControlHeader)

    // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
    if (path === '[...path]') {
        res.status(400).json({ error: 'No path specified.' })
        return
    }
    // If the path is not a valid path, return 400
    if (typeof path !== 'string') {
        res.status(400).json({ error: 'Path query invalid.' })
        return
    }
    const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path))

    const requestPath = encodePath(cleanPath)
    const requestUrlFolder = `${apiConfig.driveApi}/root${requestPath}`
  // Whether path is root, which requires some special treatment
    const isRoot = requestPath === ''
    // Handle protected routes authentication
    const odTokenHeader = (odpt as string)

    const { code, message } = await checkAuthRoute(cleanPath, accessToken, odTokenHeader)
    // Status code other than 200 means user has not authenticated yet
    if (code !== 200) {
        res.status(code).json({ error: message })
        return
    }
    // If message is empty, then the path is not protected.
    // Conversely, protected routes are not allowed to serve from cache.
    if (message !== '') {
        res.setHeader('Cache-Control', 'no-cache')
    }
    try {
        //get children of path folder
        const resFolder = await axios.get(`${requestUrlFolder}${isRoot ? '' : ':'}/children`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if(resFolder.status == 200){
            //is items id in this folder?
            if(!isIDsInFolderChildren(itemids,resFolder.data)){
                res.status(400).json({'msg':'Bad request'})
            }

            const promises = new Array()
            itemids.map((itemid:string)=>{
                // Handle response from OneDrive API
                const requestUrlDel = `${driveApi}/items/${itemid}`        
                const reqConfig = {
                    headers: { 'Authorization': `Bearer ${accessToken}`},
                }
                //delete item
                promises.push(new Promise((resolve,reject)=>{
                    axios.delete(requestUrlDel, reqConfig).then(({status})=>{
                        if(status===204){
                            resolve({status,itemid})
                        }else{
                            reject({status,itemid})
                        }
                        
                    }).catch(({status,data})=>{
                        reject({status,itemid})
                    })
                }))
            })
            let data = new Array
            // wait for all promisses
            await Promise.allSettled(promises).then((reps)=>{
                reps.map(rep=>{
                    if(rep.status==='fulfilled'){
                        //this item deleted successfully
                        const {status,itemid} = rep.value
                        data.push({itemid,status:'ok',msg:''})
                    }else{
                        //this item deleted failed
                        const {status,itemid} = rep.reason
                        data.push({itemid,status:'failed',msg:''})
                    }
                })
            })
            res.status(200).json(data)
            return 
            
        }else{
            //get folder failed
            res.status(resFolder.status).json(resFolder.data)
            return 
        }

        
    } catch (error: any) {
        // res.status(400).json(error)
        res.status(error?.response?.status ?? 500).json({ error: error?.response?.data ?? 'Internal server error.' })
        return
    }
}  