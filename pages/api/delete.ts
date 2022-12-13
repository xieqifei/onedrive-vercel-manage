import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import { driveApi, cacheControlHeader } from '../../config/api.config'
import {  getAccessToken, checkAuthRoute, rawPath } from '.'
import { posix as pathPosix } from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get access token from storage
    const accessToken = await getAccessToken()
    const { path = '', itemid = '', odpt = '' } = req.query
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
        const requestUrl = `${driveApi}/items/itemid`        
        const reqConfig = {
            headers: { 'Authorization': `Bearer ${accessToken}`},
        }
        
        const { data, status } = await axios.delete(requestUrl, reqConfig)

        if (status !== 204) {
            res.status(status).json({data})
        } else {
            res.status(204).json(data)
        }
    } catch (error: any) {
        // res.status(400).json(error)
        res.status(error?.response?.status ?? 500).json({ error: error?.response?.data ?? 'Internal server error.' })
        return
    }
}  