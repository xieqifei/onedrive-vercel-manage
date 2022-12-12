import axios from "axios"
import { OdFolderChildren } from "../types"

export const createAFolder = (foldername:string,
    parentPath:string,
    odpt:string|null)=>{
    return new Promise((resolve, reject)=>{
        axios.get(`/api/create/?path=${parentPath}&foldername=${foldername}${odpt ? `&odpt=${odpt}` : ''}`).then((res)=>{
            if(res.status===201){
                resolve(res.data as OdFolderChildren)
            }else{
                reject(res.data)
            }
        }).catch((res)=>{
            reject(res.data)
        })
     
    })
}

