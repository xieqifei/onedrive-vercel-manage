import { Dispatch, SetStateAction, useState } from "react"
import { OdFolderChildren } from "../types"
import { Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { getStoredToken } from "../utils/protectedRouteHandler";
import axios from "axios";


const DeleteBtn = ({
  folderChildren,
  setFolderChildren,
  selected}:{
  folderChildren: Array<OdFolderChildren>,
  setFolderChildren: Dispatch<SetStateAction<Array<OdFolderChildren>>>,
  selected: { [key: string]: boolean }}
) => {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)

  const [messageApi, contextHolder] = message.useMessage();

  let isBtnShow = false
  isBtnShow = Object.values(selected).some(s=>s)

  const delCountMsg = (failedItemCount:number,successItemCount:number) => {
    messageApi.open({
      type: failedItemCount===0?'success':successItemCount===0?'error':'warning',
      content: (failedItemCount===0?'':`${failedItemCount} item(s) failed. `) + (successItemCount===0?'':`${successItemCount} item(s) deleted.`),
    });
  };

  const delFailedMsg = (msg)=>{
    messageApi.open({
      type:'error',
      content:'Request failed. check:'+msg
    })
  }

  
  const deleteItem = () => {
    setLoading(true)
    //get all selected items id
    const itemids = folderChildren.filter(f => selected[f.id]).map(f => f.id)
    const data = {
      path: asPath,
      itemids,
      odpt: hashedToken
    }
    axios.post('/api/delete', data).then((rep) => {
      setLoading(false)
      //get rep data,that is a list of {status:"ok"or"failed",itemid:"","msg"}
      const itemReps = rep.data
      //are all items deleted successfully?
      let failedItemCount = 0
      let successItemCount = 0
      itemReps.map((itemRep :{ status: string; itemid: string; msg:string})=>{
        if (itemRep.status==='failed'){
          failedItemCount  = failedItemCount + 1
        }else{
          successItemCount =successItemCount+1
        }
      })
      delCountMsg(failedItemCount,successItemCount)

      // findind the items after deleted still exist
      const folderAfterDel = folderChildren.filter(f => {
        return !itemReps.some((itemRep: { status: string; itemid: string; msg:string}) => {
          if (itemRep.status === 'ok' && f.id === itemRep.itemid) {
            //if item deleted, it will not be filtered
            return true
          } else {
            return false
          }
        })
      })
      setFolderChildren(folderAfterDel)

    }).catch((rep) => {
      setLoading(false)
      delFailedMsg(rep.data)
    })
  }
  return (
    <>
      {contextHolder}
      <Button
        icon={<DeleteOutlined style={{display:'inline-flex'}}/>}
        loading={loading}
        onClick={() => deleteItem()}
        className={isBtnShow ? 'mr-2 content-center' : 'hidden'}
        danger
        size='small'
      >
       <span className='hidden'>{t('Delete')}</span> 
      </Button>
    </>

  )
}

export default DeleteBtn