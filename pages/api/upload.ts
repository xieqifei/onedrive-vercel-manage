import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { driveApi, cacheControlHeader } from '../../config/api.config'
import { encodePath, getAccessToken, checkAuthRoute } from '.'
import { posix as pathPosix } from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get access token from storage
    const accessToken = await getAccessToken()
    const {path='',filename='',odpt=''} = req.query
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
    // Handle response from OneDrive API
    const requestUrl = `${driveApi}/root${encodePath(cleanPath)}/${filename}:/createUploadSession`
    const reqConfig = {
        headers: { 'Authorization': `Bearer ${accessToken}` ,'Content-Type': 'application/json'},
      }
    const reqData = JSON.stringify({
        "item": {
          "@odata.type": "microsoft.graph.driveItemUploadableProperties",
          "@microsoft.graph.conflictBehavior": "rename",
          "name": filename
        }
      })
    const { data ,status } = await axios.post(requestUrl, reqData,reqConfig)

    if(status !== 200){
        res.status(400).json(data)
    }else{
        res.status(200).json(data)
    }
  } catch (error: any) {
    res.status(error?.response?.status ?? 500).json({ error: error?.response?.data ?? 'Internal server error.' })
    return
  }
}  