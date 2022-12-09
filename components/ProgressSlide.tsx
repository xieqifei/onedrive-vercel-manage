import { Dispatch, Fragment, SetStateAction } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { UploadingFile } from '../types'
const ListItem = ({ file, index }: { file: UploadingFile, index: number }) => {
  return (
    <li className="pt-3 pb-0 sm:pt-4" key={index}>
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
            {file.name}
          </p>
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            file size: {file.sizeStr}
          </p>
        </div>
        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
          {file.percent}%
        </div>
      </div>
    </li>
  )
}


export default function ProgressSlide(
  {
    uploadingFiles,
    slideOpen,
    setSlideOpen,
    totalUploadFileNumber,
    setTotalUploadFileNumber
  }: {
    uploadingFiles: Array<UploadingFile>
    slideOpen: boolean
    setSlideOpen: Dispatch<SetStateAction<boolean>>
    totalUploadFileNumber:number,
    setTotalUploadFileNumber:Dispatch<SetStateAction<number>>
  }
) {
  let percent:number = 0
  if(totalUploadFileNumber !==0){
    let doneNumber:number = totalUploadFileNumber - uploadingFiles.length
    percent = doneNumber/totalUploadFileNumber*100
  }
  
  return (
    <Transition.Root show={slideOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setSlideOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setSlideOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-lg font-medium text-gray-900">File Process</Dialog.Title>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {/* Replace with your content */}
                      <div className={uploadingFiles.length === 0 ? 'hidden ' : ''}>
                        <span>Uploading: {uploadingFiles.length} file(s)</span>
                        <div className="mt-2 mr-2  h-1 relative w-full rounded-full overflow-hidden">
                          <div className=" w-full h-full bg-gray-200 absolute "></div>
                          <div className=" h-full bg-green-400 absolute" style={{ width: percent+'%' }}></div>
                        </div>

                        {/* uploading file list */}
                        <div className={"flow-root"}>
                          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                            {
                              uploadingFiles.map((file, index) => {
                                return (
                                  <ListItem file={file} index={index} />
                                )
                              })
                            }

                          </ul>
                        </div>

                      </div>
                      <div className={uploadingFiles.length > 0 ? 'hidden' : ''}>
                        Completed!!
                      </div>
                      {/* /End replace */}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}