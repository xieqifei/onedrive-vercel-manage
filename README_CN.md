# Onedrive-vercel-管理

[[English](README.md)|[中文](README_CN.md)]

## ！重要

由于对onedrive API的读写访问要求存在未知风险，我强烈建议您不要将此项目用于存储重要文件的onedrive。 任何潜在的错误都可能被利用并造成毁灭性的损失。

为了安全起见，在 `config/site.config.js` 中定义的 baseDirectory 默认受密码保护。 因此，要访问它，首先您需要在baseDirectory定义的目录下创建一个名为“.password”的新文本文件，并在其中输入密码，或者将 `site.config.js` 中的 `protectedRoutes:['/']` 更改为 `protectedRoutes:[]`。 但是这将使您的存储失去密码保护。

## 1. 特点

- 断点和大文件上传

已知问题是使用开发者onedrive账号进行上传会失败。 但它适用于个人 onedrive 帐户。

![1671551482036](image/README/1671551482036.png)

- 新文件夹创建

![1671551391526](image/README/1671551391526.png)

- 删除文件

![1671551433504](image\README\1671551433504.png)

## 2. 开始

这个项目的灵感来自 [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index)，所以你可以在那里找到详细的部署文档。

点击此处查看【[入门指南](https://ovi.swo.moe/zh/docs/getting-started)】。

❗❗❗在部署之前，**不要**使用默认命令运行它，否则部署会失败。

在部署页面使用 `npm install --legacy-peer-deps` 而不是 `npm i` 或 `npm install`

使用 `npm run build` 在 vercel 运行它。

![1671554527703](image/README/1671554527703.png)

您可以在 [app.redislabs.com](app.redislabs.com) 获取免费的 Redis 数据库，或者使用onedrive-vercel-index部署说明中的推荐的数据库。

## 3.开发

使用 `npm run dev` 在本地服务器上运行它

您可以创建一个新文件名 `.env.local`

在此文件中添加如下内容。 这个REDIS_URL是redis db url，包括用户名、密码、主机和端口。 您可以在 redis.io 或其他公司免费获得一个。

```
REDIS_URL=redis://default:PSaAoZW************Fbs2cPB8F1@redis-10009.c300.eu-central-1-1.ec2.cloud.redislabs.com:10989
```

然后它将在您的本地 PC 上完美运行

在浏览器中打开 `localhost:3000` 来调试代码
