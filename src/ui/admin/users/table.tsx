'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import UserEditPopup from '@/src/ui/admin/users/useredit/userEditPopup'
import PwdEditPopup from '@/src/ui/admin/users/pwdedit/pwdEditPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Users } from '@/src/lib/tables/definitions'
import { deleteByUid, fetchUsersFiltered, fetchUsersTotalPages } from '@/src/lib/tables/users'
import Search from '@/src/ui/utils/search'
import Pagination from '@/src/ui/utils/pagination'
import { useSearchParams } from 'next/navigation'

export default function Table() {
  //
  //  URL updated with search paramenters (Search)
  //
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''
  const currentPage = Number(searchParams.get('page')) || 1

  const [users, setUsers] = useState<table_Users[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchUsers, setShouldFetchUsers] = useState(true)
  const [shouldFetchTotalPages, setShouldFetchTotalPages] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<table_Users | null>(null)
  const [selectedPwd, setSelectedPwd] = useState<table_Users | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //----------------------------------------------------------------------------------------------
  // Fetch users on mount and when shouldFetchUsers changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await fetchUsersFiltered(query, currentPage)
        setUsers(fetchedUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
    setShouldFetchUsers(false)
  }, [query, currentPage, shouldFetchUsers])
  //----------------------------------------------------------------------------------------------
  // Fetch total pages on mount and when shouldFetchTotalPages changes
  //----------------------------------------------------------------------------------------------
  useEffect(() => {
    const fetchTotalPages = async () => {
      try {
        const fetchedTotalPages = await fetchUsersTotalPages(query)
        setTotalPages(fetchedTotalPages)
      } catch (error) {
        console.error('Error fetching total pages:', error)
      }
    }
    fetchTotalPages()
    setShouldFetchTotalPages(false)
  }, [query, shouldFetchTotalPages])
  //----------------------------------------------------------------------------------------------
  //  Edit User
  //----------------------------------------------------------------------------------------------
  function handleEditClick(user: table_Users) {
    setSelectedUser(user)
    setIsModalOpen(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Password User
  //----------------------------------------------------------------------------------------------
  function handlePwdClick(user: table_Users) {
    setSelectedPwd(user)
    setIsModalOpen(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Close Modal
  //----------------------------------------------------------------------------------------------
  function handleCloseModal() {
    setIsModalOpen(false)
    setSelectedUser(null)
    setSelectedPwd(null)
    setShouldFetchUsers(true)
  }
  //----------------------------------------------------------------------------------------------
  //  Delete
  //----------------------------------------------------------------------------------------------
  function handleDeleteClick(user: table_Users) {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Deletion',
      subTitle: `Are you sure you want to delete (${user.u_uid}) : ${user.u_name}?`,
      onConfirm: async () => {
        //
        // Call the server function to delete the user
        //
        const message = await deleteByUid(user.u_uid)
        //
        // Log the returned message
        //
        console.log(message)
        //
        //  Reload the page
        //
        setShouldFetchUsers(true)
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
        <h1 className={`${lusitana.className} text-2xl`}>Users</h1>
      </div>
      <Search placeholder='uid:23 name:richard email:richardstuart007@hotmail.com fedid:1234' />
      <div className='mt-2 md:mt-6 flow-root'>
        <div className='inline-block min-w-full align-middle'>
          <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
            <table className='min-w-full text-gray-900 table-fixed table'>
              <thead className='rounded-lg text-left font-normal text-sm'>
                <tr>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Id
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Name
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Email
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Federation ID
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Admin
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Fed Country
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Provider
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Edit
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Pwd
                  </th>
                  <th scope='col' className='px-2 py-2 font-medium text-left'>
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white'>
                {users?.map(user => (
                  <tr
                    key={user.u_uid}
                    className='w-full border-b py-2 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'
                  >
                    <td className='px-2 py-1 text-sm'>{user.u_uid}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_name}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_email}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_fedid}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_admin ? 'Y' : ''}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_fedcountry}</td>
                    <td className='px-2 py-1 text-sm'>{user.u_provider}</td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleEditClick(user)}
                        className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
                      >
                        Edit
                      </button>
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      {user.u_provider === 'email' && (
                        <button
                          onClick={() => handlePwdClick(user)}
                          className='bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600'
                        >
                          Pwd
                        </button>
                      )}
                    </td>
                    <td className='px-2 py-1 text-sm'>
                      <button
                        onClick={() => handleDeleteClick(user)}
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

        {/* User Edit Modal */}
        {selectedUser && (
          <UserEditPopup
            userRecord={selectedUser}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}

        {/* Password Edit Modal */}
        {selectedPwd && (
          <PwdEditPopup userRecord={selectedPwd} isOpen={isModalOpen} onClose={handleCloseModal} />
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      </div>
    </>
  )
}
