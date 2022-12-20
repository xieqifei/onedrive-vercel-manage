# Onedrive-vercel-share

## !importent

Due to the unknown risks from the requirement of read-write access to onedrive API, I strongly suggest that you DO NOT use this project for the onedrive where important files are stored. Any potential bugs could be used and cause devastating loss.

For safty, the in `config/site.config.js` defined baseDirectory are defaultly by password protected. So, the first thing to access it, you need to create a new file named ".password", and type a password into it, OR change `protectedRoutes: ['/']`, in `site.config.js` to `protectedRoutes: []`. That will make your storage out of protection.

## 1. Features

- Muti-files upload

![1671551482036](image/README/1671551482036.png)

- New folder ceation

![1671551391526](image/README/1671551391526.png)

- Delete

![1671551433504](image/README/1671551433504.png)

## 2. Get Started

This project is inspired from [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index), so there you can find detailed docs for deployment.

Click here to see [Get Started](https://ovi.swo.moe/zh/docs/getting-started).

❗❗❗Before deployment, **DO NOT** run it using defaut command, otherwise deployment can be failed.

Use `npm install --legacy-peer-deps` instead of `npm i` or `npm install`

Use `npm run build` to run it at vercel

![1671554527703](image/README/1671554527703.png)

You can turn to redis.io to get free Redis database.

## 3. Dev

Use `npm run dev` run it on local server

You can create a new file name `.env.local`

add content like below in this file. This REDIS_URL is redis db url, including username, password, host and port. You can get free one at redis.io, or other companys.

```
REDIS_URL=redis://default:PSaAoZW**********Fbs2cPB8F1@redis-10009.c300.eu-central-1-1.ec2.cloud.redislabs.com:10989
```

then it will perfectly run on your local PC

open  `localhost:3000` on your browser to debug codes
