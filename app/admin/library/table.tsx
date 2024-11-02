'use client'

import { lusitana } from '@/app/ui/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/app/admin/library/libraryMaintPopup'
import ConfirmDialog from '@/app/ui/utils/confirmDialog'
import { LibraryTable } from '@/app/lib/definitions'
import {
  deleteLibraryById,
  fetchLibraryFiltered,
  fetchLibraryTotalPages
} from '@/app/lib/data/tables/library'
import Search from '@/app/ui/utils/search'
import Pagination from '@/app/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'

export default function Table() {
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [library, setLibrary] = useState<LibraryTable[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [shouldFetchTotalPages, setShouldFetchTotalPages] = useState(true)

  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<LibraryTable | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //----------------------------------------------------------------------------------------------
  // Fetch library on mount and when shouldFetchData changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await fetchLibraryFiltered(query, currentPage)
        setLibrary(data)
      } catch (error) {
        console.error('Error fetching library:', error)
      }
    }
    fetchdata()
    setShouldFetchData(false)
  }, [query, currentPage, shouldFetchData])
  //----------------------------------------------------------------------------------------------
  // Fetch total pages on mount and when shouldFetchTotalPages changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const fetchedTotalPages = await fetchLibraryTotalPages(query)
        setTotalPages(fetchedTotalPages)
      } catch (error) {
        console.error('Error fetching total pages:', error)
      }
    }
    fetchTotalPages()
    setShouldFetchTotalPages(false)
  }, [query, shouldFetchTotalPages])
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit(library: LibraryTable) {
    setSelectedRow(library)
    setIsModelOpenEdit(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Add
  //----------------------------------------------------------------------------------------------
  function handleClickAdd() {
    setIsModelOpenAdd(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Edit
  //----------------------------------------------------------------------------------------------
  function handleModalCloseEdit() {
    setIsModelOpenEdit(false)
    setSelectedRow(null)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal Add
  //----------------------------------------------------------------------------------------------
  function handleModalCloseAdd() {
    setIsModelOpenAdd(false)
    setShouldFetchData(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(library: LibraryTable) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${library.lrlid}) : ${library.lrdesc}?`,
      onConfirm: async () => {
        //
        // Call the server function to delete the library
        //
        const message = await deleteLibraryById(library.lrlid)
        //
        // Log the returned message
        //
        console.log(message)
        //
        //  Reload the page
        //
        setShouldFetchData(true)
        setShouldFetchTotalPages(true)
        //
        //  Reset dialog
        //
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      }
    })
  }
  //----------------------------------------------------------------------------------------------
  return (
    <>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Library</h1>
        <h1 className='px-2 py-1 text-sm'>
          <button
            onClick={() => handleClickAdd()}
            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add
          </button>
        </h1>
      </div>
      <Search placeholder='lid:123  ref:leb desc: leb who:hugger type:youtube  owner:richard  group:leb  gid:123' />
      <div className='mt-2 md:mt-6 flow-root'>
        <div className='inline-block min-w-full align-middle'>
          <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
            <table className='min-w-full text-gray-900 table-fixed table'>
              <thead className='rounded-lg text-left font-normal text-sm'>
                <tr>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Owner
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Group
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Group-Id
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Lib
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Ref
                  </th>
                  {/* <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Link
                  </th> */}
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Description
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Who
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Type
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Edit
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {library?.map(library => (
                  <tr
                    key={library.lrlid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm '>{library.lrowner}</td>
                    <td className='px-2 py-1 text-sm '>{library.lrgroup}</td>
                    <td className='px-2 py-1 text-sm '>{library.lrgid}</td>
                    <td className='px-2 py-1 text-sm '>{library.lrlid}</td>
                    <td className='px-2 py-1 text-sm '>{library.lrref}</td>
                    {/* <td className='px-2 py-1 text-sm '>{library.lrlink}</td> */}
                    <td className='px-2 py-1 text-sm '>{library.lrdesc}</td>
                    <td className='px-2 py-1 text-sm '>{library.lrwho}</td>
                    <td className='px-2 py-1 text-sm '>{library.lrtype}</td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleClickEdit(library)}
                        className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        Edit
                      </button>
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleDeleteClick(library)}
                        className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='mt-5 flex w-full justify-center'>
          <Pagination totalPages={totalPages} />
        </div>

        {/* Edit Modal */}
        {selectedRow && (
          <MaintPopup
            libraryRecord={selectedRow}
            isOpen={isModelOpenEdit}
            onClose={handleModalCloseEdit}
          />
        )}

        {/* Add Modal */}
        {isModelOpenAdd && (
          <MaintPopup libraryRecord={null} isOpen={isModelOpenAdd} onClose={handleModalCloseAdd} />
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      </div>
    </>
  )
}
