'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/src/app/admin/ownergroup/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Ownergroup } from '@/src/lib/definitions'
import { deleteById, fetchFiltered, fetchPages } from '@/src/lib/data/tables/ownergroup'
import Search from '@/src/ui/utils/search'
import Pagination from '@/src/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'
import { checkKeysInTables } from '@/src/lib/data/checkKeysInTables'

export default function Table() {
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [row, setRow] = useState<table_Ownergroup[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [shouldFetchTotalPages, setShouldFetchTotalPages] = useState(true)

  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Ownergroup | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //----------------------------------------------------------------------------------------------
  // Fetch data on mount and when shouldFetchData changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await fetchFiltered(query, currentPage)
        setRow(data)
      } catch (error) {
        console.error('Error fetching data:', error)
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
        const fetchedTotalPages = await fetchPages(query)
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
  function handleClickEdit(row: table_Ownergroup) {
    setSelectedRow(row)
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
  function handleDeleteClick(row: table_Ownergroup) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${row.oggid}) : ${row.ogtitle}?`,
      onConfirm: async () => {
        //
        // Check a list of tables if owner changes
        //
        const oggid_string = String(row.oggid)
        const tableColumnValuePairs = [
          {
            table: 'library',
            columnValuePairs: [{ column: 'lrgid', value: oggid_string }]
          },
          {
            table: 'questions',
            columnValuePairs: [{ column: 'qgid', value: oggid_string }]
          }
        ]
        const exists = await checkKeysInTables(tableColumnValuePairs)
        if (exists) {
          setMessage(`Deletion Failed.  Keys exists in other tables`)
          setConfirmDialog({ ...confirmDialog, isOpen: false })

          // Automatically clear the message after some seconds
          setTimeout(() => {
            setMessage(null)
          }, 5000)
          return
        }
        //
        // Call the server function to delete the row
        //
        const message = await deleteById(row.oggid)
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
        <h1 className={`${lusitana.className} text-2xl`}>ownergroup</h1>
        <h1 className='px-2 py-1 text-sm'>
          <button
            onClick={() => handleClickAdd()}
            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add
          </button>
        </h1>
      </div>
      <Search placeholder='oid:1  ownergroup:Richard title:Richard' />
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
                {row?.map(row => (
                  <tr
                    key={row.oggid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm '>{row.ogowner}</td>
                    <td className='px-2 py-1 text-sm '>{row.oggroup}</td>
                    <td className='px-2 py-1 text-sm '>{row.ogtitle}</td>
                    <td className='px-2 py-1 text-sm '>{row.oggid}</td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleClickEdit(row)}
                        className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        Edit
                      </button>
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleDeleteClick(row)}
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
            record={selectedRow}
            isOpen={isModelOpenEdit}
            onClose={handleModalCloseEdit}
          />
        )}

        {/* Add Modal */}
        {isModelOpenAdd && (
          <MaintPopup record={null} isOpen={isModelOpenAdd} onClose={handleModalCloseAdd} />
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />

        {/* Error message */}
        <div className='mt-2'>{message && <div className='text-red-600 mb-4'>{message}</div>}</div>
      </div>
    </>
  )
}
