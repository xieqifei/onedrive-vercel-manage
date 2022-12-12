import { Dispatch, Fragment, useRef, useState, SetStateAction } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { getStoredToken } from '../utils/protectedRouteHandler'
import LimitPromise from '../utils/LimitPromise'
import { restrictedUpload } from '../utils/uploadFile'
import { OdFolderChildren, UploadingFile } from '../types'
import { formatBytes } from '../utils/formatBytes'


const UploadDialog = ({
    menuOpen,
    setMenuOpen,
    uploadingFiles,
    setUploadingFiles,
    setSlideOpen,
    setTotalUploadFileNumber,
    uploadedFiles,
    setUploadedFiles,

}: {
    menuOpen: boolean
    setMenuOpen: Dispatch<SetStateAction<boolean>>
    uploadingFiles: Array<UploadingFile>
    setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
    setSlideOpen:Dispatch<SetStateAction<boolean>>
    setTotalUploadFileNumber:Dispatch<SetStateAction<number>>
    uploadedFiles:Array<OdFolderChildren>
    setUploadedFiles:Dispatch<SetStateAction<Array<OdFolderChildren>>>
}) => {
    const cancelButtonRef = useRef(null)
    const closeMenu = () => setMenuOpen(false)
    const { asPath } = useRouter()
    const hashedToken = getStoredToken(asPath)
    //limit the maximal number of uploading files to 6
    const limtReq = new LimitPromise(6);
    //upload file to onedrive
    const handleUploadFiles = (files) => {
        let totFileNum:number = uploadingFiles.length+files.length
        setTotalUploadFileNumber(totFileNum)
        let readyFiles = new Array<UploadingFile>
        files.map((file)=>{
            readyFiles.push({
                name: file.name, 
                percent: 0,
                sizeStr: formatBytes(file.size),
                size: file.size
            })
        })
        setUploadingFiles(readyFiles)
        setSlideOpen(true)
        const uploading = [...readyFiles]
        const uploaded = [...uploadedFiles];
        files.map(async (file) => {
            restrictedUpload(file,asPath,hashedToken,limtReq,uploadingFiles,setUploadingFiles).then((data)=>{
                uploaded.push(data as unknown as OdFolderChildren)
                //remove uploaded files from uploading list
                uploading.map((f, index) => {
                    if (f.name === file.name) {
                        uploading.splice(index, 1);
                    }
                })
                let uploadingTemp = [...uploading]
                setUploadingFiles(uploadingTemp);
                setUploadedFiles(uploaded);
            }).catch((err)=>{
                console.log(err)
            })
        })
    }

    const handleFileEvent = (e: { target: { files: any } }) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files)
        setMenuOpen(false)
        handleUploadFiles(chosenFiles);
    }

    return (
        <Transition.Root show={menuOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={closeMenu}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                        <form action="/index.php" method="POST" encType="multipart/form-data">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
      
                                            </div>
                                            <input id="dropzone-file" type="file" multiple className="hidden" onChange={handleFileEvent} />
                                        </form>
                                    </label>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default UploadDialog