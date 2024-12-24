'use client'

import { lusitana } from '@/src/fonts'
import { useState, useEffect, useCallback, useRef } from 'react'
import ConfirmDialog from '@/src/ui/utils/confirmDialog'
import { table_pg_tables } from '@/src/lib/tables/definitions'
import { fetchFiltered, fetchTotalPages } from '@/src/lib/tables/tableGeneric/table_fetch_pages'
import { table_duplicate } from '@/src/lib/tables/tableGeneric/table_duplicate'
import { table_data_copy } from '@/src/lib/tables/tableGeneric/table_data_copy'
import { table_truncate } from '@/src/lib/tables/tableGeneric/table_truncate'
import { table_count } from '@/src/lib/tables/tableGeneric/table_count'
import Pagination from '@/src/ui/utils/pagination'
import { Button } from '@/src/ui/utils/button'

export default function Table() {
  const schemaname = 'public'
  const backupStartChar = 'z'
  //
  // Define the structure for filters
  //
  type Filter = {
    column: string
    value: string | number
    operator: '=' | 'LIKE' | 'NOT LIKE' | '>' | '>=' | '<' | '<='
  }
  const filters = useRef<Filter[]>([])
  const filtersZ = useRef<Filter[]>([])
  //
  //  Selection
  //
  const rowsPerPage = 20
  //
  //  Data
  //
  const [currentPage, setcurrentPage] = useState(1)
  const [tablename, settablename] = useState('')
  const [tabledata, settabledata] = useState<table_pg_tables[]>([])
  const [tabledatacount, settabledatacount] = useState<number[]>([])
  const [shouldfetchdata, setshouldfetchdata] = useState(true)
  const [totalPages, setTotalPages] = useState<number>(0)

  const [prefix, setprefix] = useState('1_')
  const [tabledataZ, settabledataZ] = useState<table_pg_tables[]>([])
  const [tabledatacountZ, settabledatacountZ] = useState<number[]>([])

  const [message, setmessage] = useState<string>('')
  //
  //  Maintenance
  //
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    subTitle: '',
    onConfirm: () => {}
  })
  //......................................................................................
  //  Base values
  //......................................................................................
  useEffect(() => {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdate: Filter[] = [
      { column: 'schemaname', value: schemaname, operator: '=' },
      { column: 'tablename', value: `${backupStartChar}%`, operator: 'NOT LIKE' },
      { column: 'tablename', value: tablename, operator: 'LIKE' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const updatedFilters = filtersToUpdate.filter(filter => filter.value)
    //
    //  Update filter to fetch data
    //
    filters.current = updatedFilters
    //
    //  Fetch the data
    //
    setshouldfetchdata(true)
  }, [tablename])
  //......................................................................................
  //  Backup values
  //......................................................................................
  useEffect(() => {
    //
    // Construct filters dynamically from input fields
    //
    const filtersToUpdateZ: Filter[] = [
      { column: 'schemaname', value: schemaname, operator: '=' },
      { column: 'tablename', value: `${backupStartChar}${prefix}%`, operator: 'LIKE' },
      { column: 'tablename', value: tablename, operator: 'LIKE' }
    ]
    //
    // Filter out any entries where `value` is not defined or empty
    //
    const updatedFiltersZ = filtersToUpdateZ.filter(filter => filter.value)
    //
    //  Update filter to fetch data
    //
    filtersZ.current = updatedFiltersZ
    //
    //  Fetch the data
    //

    callback_fetchbackup()
  }, [tablename, prefix])
  //......................................................................................
  //
  //  Update Base data
  //
  useEffect(() => {
    setshouldfetchdata(true)
  }, [filters, tablename, currentPage])
  //......................................................................................
  //
  //  Callback - fetchBase
  //
  const fetchbase = async () => {
    setmessage('fetchbase')
    try {
      const offset = (currentPage - 1) * rowsPerPage

      const [data, totalPages] = await Promise.all([
        fetchFiltered({
          table: 'pg_tables',
          filters: filters.current,
          orderBy: 'tablename',
          limit: rowsPerPage,
          offset
        }),
        fetchTotalPages({
          table: 'pg_tables',
          filters: filters.current,
          items_per_page: rowsPerPage
        })
      ])

      const rowCounts = await Promise.all(
        data.map(async row => {
          const count = await table_count({ table: row.tablename })
          return count || 0
        })
      )

      settabledata(data)
      setTotalPages(totalPages)
      settabledatacount(rowCounts)
    } catch (error) {
      console.error('Error in fetchbase:', error)
      setmessage('Error loading data')
    } finally {
      setmessage('')
    }
  }

  const callback_fetchbase = useCallback(fetchbase, [currentPage, rowsPerPage, filters.current])
  //......................................................................................
  //
  // Callback - fetchBackup
  //
  const fetchbackup = async () => {
    try {
      //
      // Loading state
      //
      setmessage('Fetching all tables...')
      //
      // Table
      //
      const table = 'pg_tables'
      //
      // Calculate the offset for pagination
      //
      const offset = (currentPage - 1) * rowsPerPage
      //
      // Fetch table data
      //
      const dataZ = await fetchFiltered({
        table,
        filters: filtersZ.current,
        orderBy: 'tablename',
        limit: rowsPerPage,
        offset
      })
      //
      // Map data to `tabledataZ`
      //
      const updatedtabledataZ = dataZ.map(row => ({
        schemaname: row.schemaname,
        tablename: row.tablename
      }))
      settabledataZ(updatedtabledataZ)
      //
      // Fetch and update row counts for all tables
      //
      const rowCountsZ = await Promise.all(
        updatedtabledataZ.map(async row => {
          if (!row.tablename) return 0 // Default to 0 for blank table names
          const rowCount = await table_count({ table: row.tablename })
          return rowCount || 0 // Fallback to 0 if count is undefined
        })
      )
      settabledatacountZ(rowCountsZ)

      //
      // Clear loading state
      //
      setmessage('')
    } catch (error) {
      console.error('Error in fetchbackup:', error)
      setmessage('Error fetching tables')
    }
  }

  // UseCallback with proper dependency tracking
  const callback_fetchbackup = useCallback(fetchbackup, [currentPage, rowsPerPage, filtersZ])
  //...................................................................................
  //
  //  Update Base & Backup
  //
  const fetchdata = useCallback(async () => {
    try {
      await callback_fetchbase()
      await callback_fetchbackup()
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [callback_fetchbase, callback_fetchbackup])

  useEffect(() => {
    fetchdata()
    setshouldfetchdata(false)
  }, [shouldfetchdata, fetchdata, currentPage])
  //...................................................................................
  //
  // Adjust currentPage if it exceeds totalPages
  //
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      // setcurrentPage(totalPages) ?????????????????
    }
  }, [currentPage, totalPages])
  //----------------------------------------------------------------------------------------------
  //  Duplicate
  //----------------------------------------------------------------------------------------------
  function handleDupClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Duplicate',
      subTitle: `Are you sure you want to Duplicate (${tablebase}) to (${tablebackup}) ?`,
      onConfirm: () => performDup(tablebase, tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Duplicate
  //----------------------------------------------------------------------------------------------
  async function performDup(tablebase: string, tablebackup: string) {
    try {
      //
      //  Loading state
      //
      setmessage('performDup')
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      // Call the server function to Duplicate
      //
      await table_duplicate({ tablebase, tablebackup })
      //
      //  update the tabledataZ and counts
      //
      const backupTable: table_pg_tables = {
        tablename: tablebackup,
        schemaname: schemaname
      }
      //
      //  Get the index to update
      //
      const index = tabledata.findIndex(row => row.tablename === tablebase)
      //
      // Update tabledataZ with the backup table
      //
      const updatedata = [...tabledataZ]
      updatedata[index] = backupTable
      console.log('index', index)
      settabledataZ(updatedata)
      //
      // Set the count for the backup table to 0
      //
      const updatecount = [...tabledatacountZ]
      updatecount[index] = 0
      settabledatacountZ(updatecount)
      //
      //  Loading state
      //
      setmessage('')
    } catch (error) {
      console.error('Error during duplicate:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Copy
  //----------------------------------------------------------------------------------------------
  function handleCopyClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Copy',
      subTitle: `Are you sure you want to Copy Data from (${tablebase}) to (${tablebackup}) ?`,
      onConfirm: () => performCopy(tablebase, tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Copy
  //----------------------------------------------------------------------------------------------
  async function performCopy(tablebase: string, tablebackup: string) {
    try {
      //
      //  Loading state
      //
      setmessage(`Copy Data from (${tablebase}) to (${tablebackup})`)
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      // Call the server function to Duplicate
      //
      await table_data_copy({ tablebase, tablebackup })
      //
      // Update State
      //
      updateSingleTable(tablebackup)
      //
      //  Loading state
      //
      setmessage('')
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_data_copy:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  //  Clear
  //----------------------------------------------------------------------------------------------
  function handleClearClick(tablebase: string) {
    const tablebackup = `${backupStartChar}${prefix}${tablebase}`
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Clear',
      subTitle: `Are you sure you want to CLEAR (${tablebackup})?`,
      onConfirm: () => performClear(tablebackup)
    })
  }
  //----------------------------------------------------------------------------------------------
  //  Perform the Clear
  //----------------------------------------------------------------------------------------------
  async function performClear(tablebackup: string) {
    try {
      //
      //  Loading state
      //
      setmessage(`CLEAR (${tablebackup}) - starting`)
      //
      //  Reset dialog
      //
      setConfirmDialog({ ...confirmDialog, isOpen: false })
      //
      // Call the server function to Delete
      //
      await table_truncate(tablebackup)
      //
      // Update State
      //
      updateSingleTable(tablebackup)
      //
      //  Loading state
      //
      setmessage(`CLEAR (${tablebackup}) - completed`)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error during table_truncate:', error)
    }
  }
  //----------------------------------------------------------------------------------------------
  // Function: updateSingleTable
  //----------------------------------------------------------------------------------------------
  async function updateSingleTable(backupTable: string) {
    if (!backupTable) {
      console.error('No table specified for update')
      return
    }
    //
    // Display loading state
    //
    setmessage(`Updating count for table ${backupTable}...`)

    try {
      //
      // Fetch row count for the specified table
      //
      const rowCount = await table_count({ table: backupTable })
      //
      // Update `tabledatacountZ` directly for the specific table
      //
      if (rowCount !== null && rowCount !== undefined) {
        settabledatacountZ(prevCounts => {
          const index = tabledataZ.findIndex(row => row.tablename === backupTable)
          if (index === -1) {
            console.warn(`Table ${backupTable} not found in tabledataZ`)
            return prevCounts
          }
          const updatedCounts = [...prevCounts]
          updatedCounts[index] = rowCount
          return updatedCounts
        })
      } else {
        console.warn(`Failed to fetch row count for table ${backupTable}`)
      }
    } catch (error) {
      console.error('Error updating single table count:', error)
    } finally {
      // Clear loading state
      setmessage('')
    }
  }
  //----------------------------------------------------------------------------------------------
  return (
    <>
      {/** -------------------------------------------------------------------- */}
      {/** Display Label                                                        */}
      {/** -------------------------------------------------------------------- */}
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-xl`}>Tables</h1>
      </div>
      {/** -------------------------------------------------------------------- */}
      {/** TABLE                                                                */}
      {/** -------------------------------------------------------------------- */}
      <div className='mt-4 bg-gray-50 rounded-lg shadow-md overflow-x-hidden max-w-full'>
        <table className='min-w-full text-gray-900 table-auto'>
          <thead className='rounded-lg text-left font-normal text-xs'>
            {/* --------------------------------------------------------------------- */}
            {/** HEADINGS                                                                */}
            {/** -------------------------------------------------------------------- */}
            <tr>
              <th scope='col' className=' font-medium px-2'>
                Base Table
              </th>
              <th scope='col' className=' font-medium px-2'>
                Records
              </th>
              <th scope='col' className=' font-medium px-2'>
                Backup Table
              </th>
              <th scope='col' className=' font-medium px-2'>
                Records
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Duplicate Table
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Clear Data
              </th>
              <th scope='col' className=' font-medium px-2 text-center'>
                Copy Data
              </th>
            </tr>
            {/* ---------------------------------------------------------------------------------- */}
            {/* DROPDOWN & SEARCHES             */}
            {/* ---------------------------------------------------------------------------------- */}
            <tr className='text-xs align-bottom'>
              {/* ................................................... */}
              {/* tablename                                                 */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <label htmlFor='tablename' className='sr-only'>
                  Table
                </label>
                <input
                  id='tablename'
                  name='tablename'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={tablename}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    settablename(value)
                  }}
                />
              </th>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
              {/* Backup Prefix                                       */}
              {/* ................................................... */}
              <th scope='col' className='px-2'>
                <label htmlFor='prefix' className='sr-only'>
                  Prefix
                </label>
                <input
                  id='prefix'
                  name='prefix'
                  className={`w-60 md:max-w-md rounded-md border border-blue-500  py-2 font-normal text-xs`}
                  type='text'
                  value={prefix}
                  onChange={e => {
                    const value = e.target.value.split(' ')[0]
                    setprefix(value)
                  }}
                />
              </th>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
              {/* Buttons                                    */}
              {/* ................................................... */}
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              <th scope='col' className=' px-2'></th>
              {/* ................................................... */}
            </tr>
          </thead>
          {/* ---------------------------------------------------------------------------------- */}
          {/* BODY                                 */}
          {/* ---------------------------------------------------------------------------------- */}
          <tbody className='bg-white text-xs'>
            {tabledata?.map((tabledata, index) => {
              // Check if the Z table exists
              const tableExistsInZ = tabledataZ.some(
                zTable => zTable.tablename === `${backupStartChar}${prefix}${tabledata.tablename}`
              )

              return (
                <tr key={tabledata.tablename} className='w-full border-b'>
                  {/* Table Name */}
                  <td className='px-2 pt-2'>{tabledata.tablename}</td>
                  <td className='px-2 pt-2'>{tabledatacount[index] || ''}</td>
                  <td className='px-2 pt-2'>{tabledataZ[index]?.tablename || ''}</td>
                  <td className='px-2 pt-2'>{tabledatacountZ[index] || ''}</td>

                  {/* Duplicate Button - Only if Z table does not exist */}
                  <td className='px-2 py-1 text-center'>
                    {!tableExistsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleDupClick(tabledata.tablename)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Duplicate
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Clear Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {tableExistsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleClearClick(tabledata.tablename)}
                          overrideClass='h-6 px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600'
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </td>

                  {/* Copy Button - Only if Z table exists */}
                  <td className='px-2 py-1 text-center'>
                    {tableExistsInZ && (
                      <div className='inline-flex justify-center items-center'>
                        <Button
                          onClick={() => handleCopyClick(tabledata.tablename)}
                          overrideClass='h-6 px-2 py-2 text-xs text-white rounded-md bg-blue-500 hover:bg-blue-600'
                        >
                          Copy
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
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
      {/* Loading                */}
      {/* ---------------------------------------------------------------------------------- */}
      {message && (
        <div className='mt-5 flex w-full justify-center text-red-700'>
          <p>{message}</p>
        </div>
      )}
      {/* ---------------------------------------------------------------------------------- */}
      {/* Confirmation Dialog */}
      {/* ---------------------------------------------------------------------------------- */}
      <ConfirmDialog confirmDialog={confirmDialog} setConfirmDialog={setConfirmDialog} />
      {/* ---------------------------------------------------------------------------------- */}
    </>
  )
}
