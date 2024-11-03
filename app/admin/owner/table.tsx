'use client'

import { lusitana } from '@/app/ui/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/app/admin/owner/maintPopup'
import ConfirmDialog from '@/app/ui/utils/confirmDialog'
import { table_Owner } from '@/app/lib/definitions'
import {
  deleteOwnerById,
  fetchOwnerFiltered,
  fetchOwnerTotalPages
} from '@/app/lib/data/tables/owner'
import Search from '@/app/ui/utils/search'
import Pagination from '@/app/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'
import { checkKeyInTables } from '@/app/lib/data/data-utilities'

//
// Define a type for the table-column pair
//
interface TableColumnPair {
  table: string
  column: string
}

export default function Table() {
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [owner, setowner] = useState<table_Owner[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [shouldFetchTotalPages, setShouldFetchTotalPages] = useState(true)

  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Owner | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //----------------------------------------------------------------------------------------------
  // Fetch owner on mount and when shouldFetchData changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await fetchOwnerFiltered(query, currentPage)
        setowner(data)
      } catch (error) {
        console.error('Error fetching owner:', error)
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
        const fetchedTotalPages = await fetchOwnerTotalPages(query)
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
  function handleClickEdit(owner: table_Owner) {
    setSelectedRow(owner)
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
  function handleDeleteClick(owner: table_Owner) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${owner.ooid}) : ${owner.otitle}?`,
      onConfirm: async () => {
        //
        // Check a list of tables if owner changes
        //
        const keyValue = owner.oowner
        const tableColumnPairs: TableColumnPair[] = [
          { table: 'usersowner', column: 'uoowner' },
          { table: 'ownergroup', column: 'ogowner' },
          { table: 'library', column: 'lrowner' },
          { table: 'questions', column: 'qowner' },
          { table: 'usershistory', column: 'r_owner' }
        ]
        const exists = await checkKeyInTables(keyValue, tableColumnPairs)
        if (exists) {
          setMessage(`Deletion Failed.  Owner:${keyValue} exists in other tables`)
          setConfirmDialog({ ...confirmDialog, isOpen: false })

          // Automatically clear the message after some seconds
          setTimeout(() => {
            setMessage(null)
          }, 5000)
          return
        }
        //
        // Call the server function to delete the owner
        //
        const message = await deleteOwnerById(owner.ooid)
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
        <h1 className={`${lusitana.className} text-2xl`}>owner</h1>
        <h1 className='px-2 py-1 text-sm'>
          <button
            onClick={() => handleClickAdd()}
            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add
          </button>
        </h1>
      </div>
      <Search placeholder='oid:1  owner:Richard title:Richard' />
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
                    Title
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    ID
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
                {owner?.map(owner => (
                  <tr
                    key={owner.ooid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm '>{owner.oowner}</td>
                    <td className='px-2 py-1 text-sm '>{owner.otitle}</td>
                    <td className='px-2 py-1 text-sm '>{owner.ooid}</td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleClickEdit(owner)}
                        className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        Edit
                      </button>
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleDeleteClick(owner)}
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
            ownerRecord={selectedRow}
            isOpen={isModelOpenEdit}
            onClose={handleModalCloseEdit}
          />
        )}

        {/* Add Modal */}
        {isModelOpenAdd && (
          <MaintPopup ownerRecord={null} isOpen={isModelOpenAdd} onClose={handleModalCloseAdd} />
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

        {/* Error message */}
        <div className='mt-2'>{message && <div className='text-red-600 mb-4'>{message}</div>}</div>
      </div>
    </>
  )
}
