import { Dispatch, SetStateAction, useState } from "react"
import { OdFolderChildren } from "../types"
import { Button, Space } from 'antd';
import { DeleteOutlined} from '@ant-design/icons';


const DeleteBtn = (
    isDeleteBtnShow:boolean,
    folderChildren:Array<OdFolderChildren>,
    setFolderChildren:Dispatch<SetStateAction<Array<OdFolderChildren>>>
)=>{
    const [loading,setLoading] = useState(false)

    const deleteItem=()=>{

    }
    return (
        <Button
          type="primary"
          icon={<DeleteOutlined />}
          loading={loading}
          onClick={() => deleteItem()}
          className = {isDeleteBtnShow?'':'hidden'}
        >
          Delete
        </Button>
    )
}

export default DeleteBtn