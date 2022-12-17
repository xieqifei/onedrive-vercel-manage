import Redis from 'ioredis'
import siteConfig from '../config/site.config'

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash


export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const kv = new Redis(process.env.REDIS_URL || '')
  const accessToken = await kv.get(`${siteConfig.kvPrefix}access_token`)
  const refreshToken = await kv.get(`${siteConfig.kvPrefix}refresh_token`)
  kv.quit()
  return {
    accessToken,
    refreshToken,
  }
}

export async function storeOdAuthTokens({
  accessToken,
  accessTokenExpiry,
  refreshToken,
}: {
  accessToken: string
  accessTokenExpiry: number
  refreshToken: string
}): Promise<void> {
  const kv = new Redis(process.env.REDIS_URL || '')
  await kv.set(`${siteConfig.kvPrefix}access_token`, accessToken, 'EX', accessTokenExpiry)
  await kv.set(`${siteConfig.kvPrefix}refresh_token`, refreshToken)
  kv.quit()
}
