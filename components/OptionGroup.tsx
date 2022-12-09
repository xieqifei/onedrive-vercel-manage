
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Menu, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction, useRef, useState } from 'react'
import { UploadingFile } from '../types'
import UploadDialog from './UploadDialog'
import { AiOutlineEllipsis } from "react-icons/ai";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const OptionGroup = ({
  isShow,
  uploadingFiles,
  setUploadingFiles,
  setSlideOpen
}: {
  isShow: boolean
  uploadingFiles: Array<UploadingFile>
  setUploadingFiles: Dispatch<SetStateAction<Array<UploadingFile>>>
  setSlideOpen:Dispatch<SetStateAction<boolean>>
}) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={isShow ? "inline-block float-right mr-4" : "hidden "}>
      <UploadDialog menuOpen={menuOpen} setMenuOpen={setMenuOpen} uploadingFiles={uploadingFiles} setUploadingFiles={setUploadingFiles} setSlideOpen={setSlideOpen}/>
      <Menu as="div" className="relative inline-block text-left ">
        <div>
          <Menu.Button className="relative w-auto flex-shrink-0 text-sm text-gray-600 dark:text-gray-300">
            <div className='hidden sm:inline'>
              Options
              <FontAwesomeIcon className="h-3 w-3" icon="chevron-down" />
            </div>
            <div className='sm:hidden'>
            <AiOutlineEllipsis/>
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
          <Menu.Items className="absolute right-0 z-10 mt-2 md:w-56 sm:w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                    new folder
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    onClick={() => setMenuOpen(true)}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    upload files
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
                    upload folder
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