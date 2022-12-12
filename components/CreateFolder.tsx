import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import {Modal ,Input } from 'antd';
import { useRouter } from 'next/router';
import { getStoredToken } from '../utils/protectedRouteHandler';
import {createAFolder} from '../utils/createAFolder'
import { OdFolderChildren } from '../types';


const CreateFolderModal: React.FC<{
    openCreateFolderModal: boolean,
    setOpenCreateFolderModal: Dispatch<SetStateAction<boolean>>,
    uploadedFiles: Array<OdFolderChildren>,
    setUploadedFiles: Dispatch<SetStateAction<Array<OdFolderChildren>>>,
}> = ({ openCreateFolderModal, setOpenCreateFolderModal , uploadedFiles,setUploadedFiles}) => {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Please input a folder name above!');
    const folderName = useRef<string>('')
    const { asPath } = useRouter()
    const hashedToken = getStoredToken(asPath)


    //
    const handleOk = () => {
        setModalText('Creating folder : '+folderName.current);
        setConfirmLoading(true);
        if(folderName.current === ''){
            setModalText('You have not yet input any name above!')
            setConfirmLoading(false);
            return 
        }
        createAFolder(folderName.current,asPath,hashedToken).then((folderItem)=>{
            //update UI with new folder 
            let folders = [...uploadedFiles]
            folders.push(folderItem as OdFolderChildren)
            setUploadedFiles(folders)
            setConfirmLoading(false);
            setModalText('Created')
            setOpenCreateFolderModal(false);
        }).catch((data)=>{
            setModalText('Failed')
            setConfirmLoading(false);
        })
    };

    const handleCancel = () => {
        setOpenCreateFolderModal(false);
    };

    return (
        <>
            <Modal
                title="Create a folder"
                open={openCreateFolderModal}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okType='primary'
                okText='Create'
                cancelText='Cancel'
                okButtonProps={{ ghost: true }}
                destroyOnClose={true}
                afterClose={()=>{
                    setModalText('Please input a folder name above!')
                }}
            >   
                <Input placeholder="Please input folder name here!" onChange={(e)=>{
                    folderName.current = e.target.value
                }} />
                <p>{modalText}</p>

            </Modal>
        </>
    );
};

export default CreateFolderModal;

