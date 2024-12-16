'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect } from 'react'
import MaintPopup from '@/src/ui/admin/library/maintPopup'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_Library, table_LibraryGroup } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
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
  //  User context
  //
  const { sessionContext } = useUserContext()
  //
  // Define the structure for filters
  //
  type Filter = {
    column: string
    value: string | number
    operator: '=' | 'LIKE' | '>' | '>=' | '<' | '<='
  }
  const [filters, setFilters] = useState<Filter[]>([])
  //
  //  Selection
  //
  const [uid, setuid] = useState(0)
  const [widthNumber, setWidthNumber] = useState(2)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [owner, setowner] = useState(selected_owner ? selected_owner : '')
  const [group, setgroup] = useState(selected_group ? selected_group : '')
  const [desc, setdesc] = useState('')
  const [who, setwho] = useState('')
  const [ref, setref] = useState('')
  const [type, settype] = useState('')
  //
  //  Show columns
  //
  const [show_gid, setshow_gid] = useState(maintMode)
  const [show_owner, setshow_owner] = useState(false)
  const [show_group, setshow_group] = useState(false)
  const [show_lid, setshow_lid] = useState(false)
  const [show_who, setshow_who] = useState(false)
  const [show_ref, setshow_ref] = useState(false)
  const [show_type, setshow_type] = useState(false)
  const [show_questions, setshow_questions] = useState(!maintMode)
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [library, setLibrary] = useState<(table_Library | table_LibraryGroup)[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [shouldFetchData, setShouldFetchData] = useState(false)
  //
  //  Maintenance
  //
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
      setShouldFetchData(true)
    }
  }, [sessionContext])
  //......................................................................................
  //  Screen change
  //......................................................................................
  useEffect(() => {
    screenSize()
    //
    // Update on resize
    //
    window.addEventListener('resize', screenSize)
    //
    // Cleanup event listener on unmount
    //
    return () => window.removeEventListener('resize', screenSize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  //......................................................................................
  //  Screen size
  //......................................................................................
  function screenSize() {
    updateColumns()
    updateRows()
  }
  //----------------------------------------------------------------------------------------------
  //  Width
  //----------------------------------------------------------------------------------------------
  async function updateColumns() {
    //
    //  2xl, xl, lg, md, sm
    //
    const innerWidth = window.innerWidth
    let widthNumber_new = 1
    if (innerWidth >= 1536) widthNumber_new = 5
    else if (innerWidth >= 1280) widthNumber_new = 4
    else if (innerWidth >= 1024) widthNumber_new = 3
    else if (innerWidth >= 768) widthNumber_new = 2
    else widthNumber_new = 1
    //
    //  NO Change
    //
    if (widthNumber_new === widthNumber) return
    //
    //  Update widthNumber
    //
    setWidthNumber(widthNumber_new)
    //
    //  Initialize all values to false
    //
    setshow_gid(false)
    setshow_owner(false)
    setshow_group(false)
    setshow_lid(false)
    setshow_who(false)
    setshow_ref(false)
    setshow_type(false)
    setshow_questions(false)
    //
    //  larger screens
    //
    if (widthNumber_new >= 2) {
      setshow_gid(true)
      setshow_owner(true)
      setshow_group(true)
      if (!maintMode) setshow_questions(true)
      setshow_type(true)
    }
    if (widthNumber_new >= 3) {
      setshow_who(true)
    }
    if (widthNumber_new >= 4) {
      setshow_lid(true)
      setshow_ref(true)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Height affects ROWS
  //----------------------------------------------------------------------------------------------
  async function updateRows() {
    const innerHeight = window.innerHeight
    //
    //  2xl, xl, lg, md, sm
    //
    let screenRows = 5
    if (innerHeight >= 864) screenRows = 17
    else if (innerHeight >= 720) screenRows = 13
    else if (innerHeight >= 576) screenRows = 10
    else if (innerHeight >= 512) screenRows = 9
    else screenRows = 4
    //
    //  NO Change
    //
    if (screenRows === rowsPerPage) return
    //
    //  Set the screenRows per page
    //
    setRowsPerPage(screenRows)
    //
    //  Change of Rows
    //
    setcurrentPage(1)
    setShouldFetchData(true)
  }
  //......................................................................................
  // Reset the group when the owner changes
  //......................................................................................
  useEffect(() => {
    setgroup('')
  }, [owner])
  //......................................................................................
  //  Update the filters array based on selected values
  //......................................................................................
  useEffect(() => {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'lrowner', value: owner, operator: '=' },
      { column: 'lrgroup', value: group, operator: '=' },
      { column: 'lrwho', value: who, operator: '=' },
      { column: 'lrtype', value: type, operator: '=' },
      { column: 'lrref', value: ref, operator: 'LIKE' },
      { column: 'lrdesc', value: desc, operator: 'LIKE' }
    ]
    //
    // Add the 'uouid' filter if not in maintMode
    //
    if (!maintMode) {
      filtersToUpdate.push({ column: 'uouid', value: uid, operator: '=' })
    }
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const updatedFilters = filtersToUpdate.filter(filter => filter.value)
    //
    //  Update filter to fetch data
    //
    setFilters(updatedFilters)
    setShouldFetchData(true)
  }, [uid, owner, group, who, type, ref, desc, maintMode])
  //......................................................................................
  // Fetch on mount and when shouldFetchData changes
  //......................................................................................
  //
  //  Change of filters
  //
  useEffect(() => {
    if (filters.length > 0) {
      setcurrentPage(1)
      setShouldFetchData(true)
    }
  }, [filters])
  //
  // Reset currentPage to 1 when fetching new data
  //
  useEffect(() => {
    if (shouldFetchData) setcurrentPage(1)
  }, [shouldFetchData])
  //
  // Adjust currentPage if it exceeds totalPages
  //
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setcurrentPage(totalPages)
    }
  }, [currentPage, totalPages])
  //
  // Change of current page or should fetch data
  //
  useEffect(() => {
    fetchdata()
    setShouldFetchData(false)
    // eslint-disable-next-line
  }, [currentPage, shouldFetchData])
  //----------------------------------------------------------------------------------------------
  // fetchdata
  //----------------------------------------------------------------------------------------------
  async function fetchdata() {
    //
    //  Not Maint mode & uid = 0 then exit
    //
    if (!maintMode && uid === 0) return
    //
    //  Continue to get data
    //
    try {
      //
      //  Table
      //
      const table = 'library'
      //
      //  Joins
      //
      let joins
      if (!maintMode) {
        joins = [
          { table: 'usersowner', on: 'lrowner = uoowner' },
          { table: 'ownergroup', on: 'lrgid = oggid' }
        ]
      }
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      //  Get data
      //
      const data = await fetchFiltered({
        table,
        joins,
        filters,
        orderBy: 'lrowner, lrgroup, lrref',
        limit: rowsPerPage,
        offset
      })
      setLibrary(data)
      //
      //  Total number of pages
      //
      const fetchedTotalPages = await fetchTotalPages({
        table,
        joins,
        filters,
        items_per_page: rowsPerPage
      })
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
        <h1 className={`${lusitana.className} text-xl`}>
          {maintMode ? 'Library MAINT' : `Library`}
        </h1>
        {/** -------------------------------------------------------------------- */}
        {/** Add button                                                        */}
        {/** -------------------------------------------------------------------- */}
        {maintMode && (
          <button
            onClick={() => handleClickAdd()}
            className='bg-green-500 text-white px-2 py-1 font-normal text-sm rounded-md hover:bg-green-600'
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
                  {selected_owner ? (
                    <h1>{selected_owner}</h1>
                  ) : uid === undefined || uid === 0 ? null : maintMode ? (
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
              {/* ................................................... */}
              {/* LIBRARY ID                                          */}
              {/* ................................................... */}
              {show_lid && <th scope='col' className=' pl-2'></th>}
              {/* ................................................... */}
              {/* REF                                                 */}
              {/* ................................................... */}
              {show_ref && (
                <th scope='col' className=' pl-2 '>
                  <label htmlFor='ref' className='sr-only'>
                    Reference
                  </label>
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
                <label htmlFor='desc' className='sr-only'>
                  Description
                </label>
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
                  <td className=' pl-2 pt-2 text-left'>{selected_gid ? '' : library.lrgid}</td>
                )}
                {show_owner && <td className=' pl-2 pt-2'>{owner ? '' : library.lrowner}</td>}
                {show_group && <td className=' pl-2 pt-2'>{group ? '' : library.lrgroup}</td>}
                {show_lid && <td className=' pl-2 pt-2 text-left'>{library.lrlid}</td>}
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
                {show_questions && 'ogcntquestions' in library && (
                  <td className='pl-2 pt-2 text-center'>
                    {library.ogcntquestions > 0 ? library.ogcntquestions : ' '}
                  </td>
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
                    {'ogcntquestions' in library && library.ogcntquestions > 0 ? (
                      <Link
                        href={`/dashboard/quiz/${library.lrgid}`}
                        className='bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 px-2 py-1'
                      >
                        Quiz
                      </Link>
                    ) : (
                      ' '
                    )}
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
