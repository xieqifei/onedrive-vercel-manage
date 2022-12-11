
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction, useRef } from 'react'
import { OdFolderChildren, UploadingFile } from '../types'
import { AiOutlineEllipsis,AiOutlineUpload ,AiOutlineFolderOpen,AiOutlineFolderAdd} from "react-icons/ai";
import { formatBytes } from '../utils/formatBytes'
import LimitPromise from '../utils/LimitPromise'
import { useRouter } from 'next/router'
import { getStoredToken } from '../utils/protectedRouteHandler'
import { restrictedUpload } from '../utils/uploadFile'


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const OptionGroup = ({
  isOptionBtnShow,
  uploadingFiles,
  uploadedFiles,
  setUploadedFiles,
  setUploadingFiles,
  setSlideOpen,
  setTotalUploadFileNumber
}: {
  isOptionBtnShow: boolean
  uploadingFiles: Array<UploadingFile>
  uploadedFiles: Array<OdFolderChildren>
  setUploadedFiles: Dispatch<SetStateAction<Array<OdFolderChildren>>>
  setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
  setSlideOpen: Dispatch<SetStateAction<boolean>>,
  setTotalUploadFileNumber: Dispatch<SetStateAction<number>>
}) => {

  const { asPath } = useRouter()
  const uploadInput = useRef<HTMLInputElement>(null)
  const hashedToken = getStoredToken(asPath)

  //limit the maximal number of uploading files to 6
  const limtReq = new LimitPromise(6);

  //upload file to onedrive
  const handleUploadFiles = (files) => {
    let totFileNum: number = uploadingFiles.length + files.length
    setTotalUploadFileNumber(totFileNum)
    let readyFiles = new Array<UploadingFile>
    files.map((file) => {
      readyFiles.push({
        name: file.name,
        percent: 0,
        sizeStr: formatBytes(file.size)
      })
    })
    setUploadingFiles(readyFiles)
    setSlideOpen(true)
    const uploading = [...readyFiles]
    const uploaded = [...uploadedFiles];
    files.map(async (file) => {
      restrictedUpload(file, asPath, hashedToken, limtReq, uploadingFiles, setUploadingFiles).then((data) => {
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
      }).catch((err) => {
        console.log(err)
      })
    })
  }

  const handleFileEvent = (e: { target: { files: any } }) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files)
    // setMenuOpen(false)
    handleUploadFiles(chosenFiles);
  }

  return (
    <div className={isOptionBtnShow ? "inline-block float-right mr-4" : "hidden "}>
      <input type="file" ref={uploadInput} multiple className="hidden" onChange={handleFileEvent} />
      {/* <UploadDialog {...uploadDialogProps}/> */}
      <Menu as="div" className="relative inline-block text-left ">
        <div>
          <Menu.Button className="relative w-auto flex-shrink-0 text-sm text-gray-600 dark:text-gray-300">
            <div className='hidden sm:inline'>
              Options
              <FontAwesomeIcon className="h-3 w-3" icon="chevron-down" />
            </div>
            <div className='sm:hidden'>
              <AiOutlineEllipsis />
            </div>

          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-40 md:w-56 sm:w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    <AiOutlineFolderAdd className='inline mr-1'/> 
                    New folder
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    // onClick={() => setMenuOpen(true)}
                    onClick={() => {
                      uploadInput.current?.click()
                    }}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    <AiOutlineUpload className="inline mr-1"/>
                    Upload files
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                  <AiOutlineFolderOpen className='inline mr-1'/> Upload folder
                  </a>
                )}
              </Menu.Item>
           
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default OptionGroup