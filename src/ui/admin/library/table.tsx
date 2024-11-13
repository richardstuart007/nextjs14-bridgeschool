'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/library/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Library } from '@/src/lib/tables/definitions'
import {
  deleteLibraryById,
  fetchLibraryFiltered,
  fetchLibraryTotalPages
} from '@/src/lib/tables/library'
import Pagination from '@/src/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'
import SearchWithState from '@/src/ui/utils/search/search-withState'
import SearchWithURL from '@/src/ui/utils/search/search-withURL'

interface FormProps {
  gid?: string | null
}
export default function Table({ gid }: FormProps) {
  console.log('gid:', gid)

  const [searchValue, setSearchValue] = useState(gid ? `gid:${gid}` : '')
  const [library, setLibrary] = useState<table_Library[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [shouldFetchTotalPages, setShouldFetchTotalPages] = useState(true)

  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Library | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })

  const placeholder =
    'lid:123  ref:leb desc: leb who:hugger type:youtube  owner:richard  group:leb  gid:123'
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  //
  //  Update search with Props or URL
  //
  const query = gid ? searchValue : searchParams.get('query') || ''
  const currentPage = gid ? 1 : parseInt(searchParams.get('page') || '1', 10)
  console.log('query', query)
  console.log('currentPage', currentPage)
  //----------------------------------------------------------------------------------------------
  // Fetch library on mount and when shouldFetchData changes
  //
  useEffect(() => {
    console.log('fetchdata on change')
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData])
  //----------------------------------------------------------------------------------------------
  // Fetch total pages on mount and when shouldFetchTotalPages changes
  //
  useEffect(() => {
    console.log('fetchTotalPages')
    fetchTotalPages()
    setShouldFetchTotalPages(false)
    // eslint-disable-next-line
  }, [shouldFetchTotalPages])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    try {
      console.log('query', query)
      const data = await fetchLibraryFiltered(query, currentPage)
      console.log('data', data)
      setLibrary(data)
    } catch (error) {
      console.error('Error fetching library:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  // Fetch total pages
  //----------------------------------------------------------------------------------------------
  async function fetchTotalPages() {
    try {
      const fetchedTotalPages = await fetchLibraryTotalPages(query)
      setTotalPages(fetchedTotalPages)
    } catch (error) {
      console.error('Error fetching total pages:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Edit
  //----------------------------------------------------------------------------------------------
  function handleClickEdit(library: table_Library) {
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
  function handleDeleteClick(library: table_Library) {
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
  // This will be passed down to SearchWithState to update the parent component's state
  //----------------------------------------------------------------------------------------------
  const handleSearch = (value: string) => {
    setSearchValue(value)
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
      {gid ? (
        <SearchWithState
          placeholder={placeholder}
          searchValue={searchValue}
          setsearchValue={handleSearch}
          setShouldFetchData={setShouldFetchData}
        />
      ) : (
        <SearchWithURL placeholder={placeholder} setShouldFetchData={setShouldFetchData} />
      )}
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
