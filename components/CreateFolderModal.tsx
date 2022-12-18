import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import {Modal ,Input } from 'antd';
import { useRouter } from 'next/router';
import { getStoredToken } from '../utils/protectedRouteHandler';
import {createAFolder} from '../utils/createAFolder'
import { OdFolderChildren } from '../types';
import { useTranslation } from 'next-i18next';
import { clearPageAsyncChanged, setPageAsyncChanged } from '../utils/asyncChangedPage';


const CreateFolderModal: React.FC<{
    openCreateFolderModal: boolean,
    setOpenCreateFolderModal: Dispatch<SetStateAction<boolean>>,
    folderChildren: Array<OdFolderChildren>,
    setFolderChildren: Dispatch<SetStateAction<Array<OdFolderChildren>>>,
}> = ({ openCreateFolderModal, setOpenCreateFolderModal ,folderChildren,setFolderChildren}) => {
    
    const {t} = useTranslation()
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('');
    const folderName = useRef<string>('')
    const { asPath } = useRouter()
    const hashedToken = getStoredToken(asPath)
       //
    const handleOk = () => {
        setModalText(t('Creating folder')+' : '+folderName.current);
        setConfirmLoading(true);
        if(folderName.current === ''){
            setModalText(t('You have not yet input any name above!'))
            setConfirmLoading(false);
            return 
        }
        createAFolder(folderName.current,asPath,hashedToken).then((folderItem)=>{
            setPageAsyncChanged()
            //update UI with new folder 
            let folders = [...folderChildren]
            folders.unshift(folderItem as OdFolderChildren)
            setFolderChildren(folders)
            setConfirmLoading(false);
            setModalText(t('Created'))
            setOpenCreateFolderModal(false);
        }).catch((data)=>{
            setModalText(t('Failed'))
            setConfirmLoading(false);
        })
    };

    const handleCancel = () => {
        setOpenCreateFolderModal(false);
    };

    return (
        <>
            <Modal
                title={t("Create a folder")}
                open={openCreateFolderModal}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                okType='primary'
                okText={t('Create')}
                cancelText={t('Cancel')}
                okButtonProps={{ ghost: true }}
                destroyOnClose={true}
                afterClose={()=>{
                    setModalText(t('Please input a folder name above!'))
                }}
            >   
                <Input placeholder={t("Please input folder name here!")} onChange={(e)=>{
                    folderName.current = e.target.value
                }} onPressEnter={(e)=>{
                    handleOk()
                }}/>
                <p>{modalText?modalText:t('Please input a folder name above!')}</p>

            </Modal>
        </>
    );
};

export default CreateFolderModal;

