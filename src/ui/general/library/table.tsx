'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/library/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Library, table_LibraryGroup } from '@/src/lib/tables/definitions'
import {
  fetchLibraryFiltered,
  fetchLibraryTotalPages
} from '@/src/lib/tables/tableSpecific/library'
import Pagination from '@/src/ui/utils/pagination'
import { table_delete } from '@/src/lib/tables/tableGeneric/table_delete'
import { update_ogcntlibrary } from '@/src/lib/tables/tableSpecific/ownergroup'
import DropdownGeneric from '@/src/ui/utils/dropdown/dropdown-generic'
import Link from 'next/link'
import { useUserContext } from '@/UserContext'

interface FormProps {
  selected_gid?: number | null
  selected_owner?: string | null
  selected_group?: string | null
  maintMode?: boolean | null
}
export default function Table({
  selected_gid,
  selected_owner,
  selected_group,
  maintMode = false
}: FormProps) {
  //
  //  Initial Search Value
  //
  let initial_searchValue = ''
  if (selected_gid) initial_searchValue = `gid=${selected_gid}`
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  //  State
  //
  const [uid, setuid] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [searchValue, setSearchValue] = useState(initial_searchValue)
  const [owner, setowner] = useState(selected_owner ? selected_owner : '')
  const [group, setgroup] = useState(selected_group ? selected_group : '')
  const [desc, setdesc] = useState('')
  const [who, setwho] = useState('')
  const [ref, setref] = useState('')
  const [type, settype] = useState('')

  const [show_gid, setshow_gid] = useState(maintMode)
  const [show_owner, setshow_owner] = useState(true)
  const [show_group, setshow_group] = useState(true)
  const [show_lid, setshow_lid] = useState(true)
  const [show_who, setshow_who] = useState(true)
  const [show_ref, setshow_ref] = useState(true)
  const [show_type, setshow_type] = useState(true)
  const [show_questions, setshow_questions] = useState(!maintMode)

  const [currentPage, setcurrentPage] = useState(1)
  const [library, setLibrary] = useState<(table_Library | table_LibraryGroup)[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(true)
  const [isModelOpenEdit, setIsModelOpenEdit] = useState(false)
  const [isModelOpenAdd, setIsModelOpenAdd] = useState(false)
  const [selectedRow, setSelectedRow] = useState<table_Library | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  //  UID
  //......................................................................................
  useEffect(() => {
    if (sessionContext?.cxuid) {
      setuid(sessionContext.cxuid)
    }
  }, [sessionContext])
  //......................................................................................
  //  Screen change
  //......................................................................................
  useEffect(() => {
    updateScreen()
    setcurrentPage(1)
    // Update on resize
    window.addEventListener('resize', updateScreen)

    // Cleanup event listener on unmount
    return () => window.removeEventListener('resize', updateScreen)
  }, [])
  //......................................................................................
  //  Screen width - items per page width
  //......................................................................................
  function updateScreen() {
    //............................................................
    //  Width
    //............................................................
    const width = window.innerWidth

    let screenwidth = 1
    if (width >= 1536) {
      screenwidth = 5
    } else if (width >= 1280) {
      screenwidth = 4
    } else if (width >= 1024) {
      screenwidth = 3
    } else if (width >= 768) {
      screenwidth = 2
    } else {
      screenwidth = 1
    }

    if (screenwidth < 5) {
      setshow_lid(false)
      setshow_ref(false)
    }
    if (screenwidth < 4) {
      setshow_gid(false)
      setshow_owner(false)
      setshow_group(false)
      setshow_questions(false)
      setshow_type(false)
    }
    if (screenwidth < 3) {
      setshow_who(false)
    }
    if (screenwidth < 2) {
    }
    //............................................................
    //  Height
    //............................................................
    const height = window.innerHeight

    let rows = 15
    //
    //  2xl
    //
    if (height >= 864) {
      rows = 20
    }
    //
    //  xl
    //
    else if (height >= 720) {
      rows = 13
    }
    //
    //  lg
    //
    else if (height >= 576) {
      rows = 10
    }
    //
    //  md
    //
    else if (height >= 512) {
      rows = 9
    }
    //
    //  sm
    //
    else {
      rows = 7
    }
    //
    //  Set the rows per page
    //
    setItemsPerPage(rows)
  }

  //......................................................................................
  // Reset the group when the owner changes
  //......................................................................................
  useEffect(() => {
    setgroup('')
  }, [owner])
  //......................................................................................
  //  Update the query string based on search values
  //......................................................................................
  useEffect(() => {
    //
    // Update the searchValue by iterating through all filters
    //
    const filtersToUpdate = { owner, group, who, type, ref, desc }
    const exactMatchFields = ['owner', 'group', 'who', 'type']
    let updatedQuery = searchValue
    for (const [key, value] of Object.entries(filtersToUpdate)) {
      const exactMatch = exactMatchFields.includes(key)
      updatedQuery = updateQuery(updatedQuery, key, value, exactMatch)
    }
    //
    //  Set the search value
    //
    setSearchValue(updatedQuery)
    setShouldFetchData(true)
  }, [owner, group, who, type, ref, desc, searchValue])

  //......................................................................................
  // Fetch library on mount and when shouldFetchData changes
  //......................................................................................
  useEffect(() => {
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData, searchValue])
  //----------------------------------------------------------------------------------------------
  // Define updateQuery as a function
  //----------------------------------------------------------------------------------------------
  function updateQuery(
    searchValue: string,
    key: string,
    value: string,
    exactMatch: boolean = false
  ) {
    //
    // Split the current searchValue into an array of filters
    //
    const filters = searchValue ? searchValue.split(' ').filter(Boolean) : []
    //
    // Remove any existing filter for the given key
    //
    const updatedFilters = filters.filter(
      filter => !filter.startsWith(`${key}:`) && !filter.startsWith(`${key}=`)
    )
    //
    // Add the new filter if the value is not empty
    //
    if (value) {
      const operator = exactMatch ? '=' : ':' // Use = for exact match or : for like match
      updatedFilters.push(`${key}${operator}${value}`)
    }
    //
    // Return the updated query string
    //
    const returnValue = updatedFilters.join(' ')
    return returnValue
  }
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    try {
      //
      //  Filtered data
      //
      const propsData = {
        query: searchValue,
        currentPage: currentPage,
        items_per_page: itemsPerPage,
        ...(maintMode ? {} : { uid })
      }
      const data = await fetchLibraryFiltered(propsData)
      setLibrary(data)
      //
      //  Total number of pages
      //
      const propsPages = {
        query: searchValue,
        items_per_page: itemsPerPage,
        ...(maintMode ? {} : { uid })
      }
      const fetchedTotalPages = await fetchLibraryTotalPages(propsPages)
      setTotalPages(fetchedTotalPages)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error fetching library:', error)
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
      onConfirm: () => performDelete(library)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the delete
  //----------------------------------------------------------------------------------------------
  async function performDelete(library: table_Library) {
    try {
      //
      // Call the server function to delete
      //
      const Params = {
        table: 'library',
        whereColumnValuePairs: [{ column: 'lrlid', value: library.lrlid }]
      }
      await table_delete(Params)
      //
      //  update Library counts in Ownergroup
      //
      await update_ogcntlibrary(library.lrgid)
      //
      //  Reload the page
      //
      setShouldFetchData(true)
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
    } catch (error) {
      console.error('Error during deletion:', error)
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false })
  }
  //----------------------------------------------------------------------------------------------
  return (
    <>
      {/** -------------------------------------------------------------------- */}
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>
          {maintMode ? 'Library MAINT' : `Library`}
        </h1>
        {/** -------------------------------------------------------------------- */}
        {/** Add button                                                        */}
        {/** -------------------------------------------------------------------- */}
        {maintMode && (
          <button
            onClick={() => handleClickAdd()}
            className='bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600'
          >
            Add
          </button>
        )}
      </div>
      {/** -------------------------------------------------------------------- */}
      {/** TABLE                                                                */}
      {/** -------------------------------------------------------------------- */}
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left font-normal text-xs'>
            {/* ---------------------------------------------------------------------------------- */}
            {/** HEADINGS                                                                */}
            {/** -------------------------------------------------------------------- */}
            <tr className='text-xs'>
              {show_gid && (
                <th scope='col' className=' font-medium pl-2'>
                  Gid
                </th>
              )}
              {show_owner && (
                <th scope='col' className=' font-medium pl-2'>
                  Owner
                </th>
              )}
              {show_group && (
                <th scope='col' className=' font-medium pl-2'>
                  Group-name
                </th>
              )}
              {show_lid && (
                <th scope='col' className=' font-medium pl-2'>
                  Lid
                </th>
              )}
              {show_ref && (
                <th scope='col' className=' font-medium pl-2'>
                  Ref
                </th>
              )}
              <th scope='col' className=' font-medium pl-2'>
                Description
              </th>
              {show_who && (
                <th scope='col' className=' font-medium pl-2'>
                  Who
                </th>
              )}
              {show_type && (
                <th scope='col' className=' font-medium pl-2'>
                  Type
                </th>
              )}

              <th scope='col' className=' font-medium pl-2 text-center'>
                {maintMode ? 'Edit' : 'View'}
              </th>

              {show_questions && (
                <th scope='col' className=' font-medium pl-2 text-center'>
                  Questions
                </th>
              )}
              <th scope='col' className=' font-medium pl-2 text-center'>
                {maintMode ? 'Delete' : 'Quiz'}
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              {/* ................................................... */}
              {/* GID                                                 */}
              {/* ................................................... */}
              {show_gid && (
                <th scope='col' className=' pl-2'>
                  {selected_gid ? <h1>{selected_gid}</h1> : null}
                </th>
              )}
              {/* ................................................... */}
              {/* OWNER                                                 */}
              {/* ................................................... */}
              {show_owner && (
                <th scope='col' className='pl-2'>
                  {uid === undefined || uid === 0 ? null : selected_owner ? (
                    <h1>{selected_owner}</h1>
                  ) : maintMode ? (
                    <DropdownGeneric
                      selectedOption={owner}
                      setSelectedOption={setowner}
                      name='owner'
                      table='owner'
                      orderBy='oowner'
                      optionLabel='oowner'
                      optionValue='oowner'
                      dropdownWidth='w-28'
                      includeBlank={true}
                    />
                  ) : (
                    <DropdownGeneric
                      selectedOption={owner}
                      setSelectedOption={setowner}
                      searchEnabled={false}
                      name='owner'
                      table='usersowner'
                      tableColumn='uouid'
                      tableColumnValue={uid}
                      orderBy='uouid, uoowner'
                      optionLabel='uoowner'
                      optionValue='uoowner'
                      dropdownWidth='w-28'
                      includeBlank={true}
                    />
                  )}
                </th>
              )}
              {/* ................................................... */}
              {/* GROUP                                                 */}
              {/* ................................................... */}
              {show_group && (
                <th scope='col' className=' pl-2'>
                  {selected_group ? (
                    <h1>{selected_group}</h1>
                  ) : owner === undefined || owner === '' ? null : (
                    <DropdownGeneric
                      selectedOption={group}
                      setSelectedOption={setgroup}
                      name='group'
                      table='ownergroup'
                      tableColumn='ogowner'
                      tableColumnValue={owner}
                      orderBy='ogowner, oggroup'
                      optionLabel='oggroup'
                      optionValue='ogroup'
                      dropdownWidth='w-36'
                      includeBlank={true}
                    />
                  )}
                </th>
              )}
              {show_lid && <th scope='col' className=' '></th>}
              {/* ................................................... */}
              {/* REF                                                 */}
              {/* ................................................... */}
              {show_ref && (
                <th scope='col' className=' pl-2 '>
                  <input
                    id='ref'
                    name='ref'
                    className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                    type='text'
                    value={ref}
                    onChange={e => {
                      const value = e.target.value.split(' ')[0]
                      setref(value)
                    }}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* DESC                                                 */}
              {/* ................................................... */}
              <th scope='col' className='pl-2'>
                <input
                  id='desc'
                  name='desc'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={desc}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setdesc(value)
                  }}
                />
              </th>
              {/* ................................................... */}
              {/* WHO                                                 */}
              {/* ................................................... */}
              {show_who && (
                <th scope='col' className=' pl-2'>
                  <DropdownGeneric
                    selectedOption={who}
                    setSelectedOption={setwho}
                    name='who'
                    table='who'
                    orderBy='wtitle'
                    optionLabel='wtitle'
                    optionValue='wwho'
                    dropdownWidth='w-28'
                    includeBlank={true}
                  />
                </th>
              )}
              {/* ................................................... */}
              {/* type                                                 */}
              {/* ................................................... */}
              {show_type && (
                <th scope='col' className=' pl-2'>
                  <DropdownGeneric
                    selectedOption={type}
                    setSelectedOption={settype}
                    name='type'
                    table='reftype'
                    orderBy='rttitle'
                    optionLabel='rttitle'
                    optionValue='rttype'
                    dropdownWidth='w-28'
                    includeBlank={true}
                  />
                </th>
              )}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {library?.map(library => (
              <tr key={library.lrlid} className='w-full border-b'>
                {show_gid && (
                  <td className=' pl-2 pt-2 text-center'>{selected_gid ? '' : library.lrgid}</td>
                )}
                {show_owner && <td className=' pl-2 pt-2'>{owner ? '' : library.lrowner}</td>}
                {show_group && <td className=' pl-2 pt-2'>{group ? '' : library.lrgroup}</td>}
                {show_lid && <td className=' pl-2 pt-2 text-center'>{library.lrlid}</td>}
                {show_ref && <td className=' pl-2 pt-2'>{library.lrref}</td>}
                <td className='pl-2 pt-2'>
                  {library.lrdesc.length > 40
                    ? `${library.lrdesc.slice(0, 35)}...`
                    : library.lrdesc}
                </td>
                {show_who && <td className=' pl-2 pt-2'>{library.lrwho}</td>}
                {show_type && <td className=' pl-2 pt-2'>{library.lrtype}</td>}
                {/* ................................................... */}
                {/* Button  1                                                 */}
                {/* ................................................... */}
                {maintMode ? (
                  <td className=' pl-2 pt-2 text-center'>
                    <button
                      onClick={() => handleClickEdit(library)}
                      className='text-white rounded-md bg-blue-500 hover:bg-blue-600 px-2 py-1'
                    >
                      Edit
                    </button>
                  </td>
                ) : (
                  <td className=' pl-2 pt-2 text-center'>
                    <button
                      className='bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 px-2 py-1'
                      onClick={() => window.open(`${library.lrlink}`, '_blank')}
                    >
                      {library.lrtype === 'youtube' ? 'Video' : 'Book'}
                    </button>
                  </td>
                )}
                {/* ................................................... */}
                {/* Questions                                            */}
                {/* ................................................... */}
                {show_questions && 'ogcntquestions' in library && library.ogcntquestions > 0 && (
                  <td className=' pl-2 pt-2 text-center'>{library.ogcntquestions}</td>
                )}
                {/* ................................................... */}
                {/* Button  2                                                 */}
                {/* ................................................... */}
                {maintMode ? (
                  <td className=' pl-2 pt-2 text-center'>
                    <button
                      onClick={() => handleDeleteClick(library)}
                      className='bg-red-500 text-white rounded-md hover:bg-red-600 px-2 py-1'
                    >
                      Delete
                    </button>
                  </td>
                ) : (
                  <td className=' pl-2 pt-2 text-center'>
                    <Link
                      href={`/dashboard/quiz/${library.lrgid}`}
                      className='bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 px-2 py-1'
                    >
                      Quiz
                    </Link>
                  </td>
                )}
                {/* ---------------------------------------------------------------------------------- */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------------------------------------------------------------------------- */}
      {/* Pagination                */}
      {/* ---------------------------------------------------------------------------------- */}
      <div className='mt-5 flex w-full justify-center'>
        <Pagination
          totalPages={totalPages}
          statecurrentPage={currentPage}
          setStateCurrentPage={setcurrentPage}
        />
      </div>
      {/* ---------------------------------------------------------------------------------- */}
      {/* Maintenance functions              */}
      {/* ---------------------------------------------------------------------------------- */}
      {maintMode && (
        <>
          {/* Edit Modal */}
          {selectedRow && (
            <MaintPopup
              libraryRecord={selectedRow}
              isOpen={isModelOpenEdit}
              onClose={handleModalCloseEdit}
            />
          )}

          {/* Add Modal */}
          {maintMode && isModelOpenAdd && (
            <MaintPopup
              libraryRecord={null}
              selected_owner={selected_owner}
              selected_group={selected_group}
              isOpen={isModelOpenAdd}
              onClose={handleModalCloseAdd}
            />
          )}

          {/* Confirmation Dialog */}
          <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
        </>
      )}
      {/* ---------------------------------------------------------------------------------- */}
    </>
  )
}
