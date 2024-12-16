import { useEffect, useState, useCallback } from 'react'
import DropdownSearch from '@/src/ui/utils/dropdown/dropdownSearch'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

type DropdownProps = {
  selectedOption: string
  setSelectedOption: (value: string) => void
  searchEnabled?: boolean
  name: string
  label?: string
  table: string
  tableColumn?: string
  tableColumnValue?: string | number
  orderBy: string
  optionLabel: string
  optionValue: string
  dropdownWidth?: string
  includeBlank?: boolean
}

export default function DropdownGeneric({
  selectedOption,
  setSelectedOption,
  searchEnabled = false,
  name,
  label,
  table,
  tableColumn,
  tableColumnValue,
  orderBy,
  optionLabel,
  optionValue,
  dropdownWidth,
  includeBlank = false
}: DropdownProps) {
  const [dropdownOptions, setDropdownOptions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  //---------------------------------------------------------------------
  //  Load dropdown options from the database
  //---------------------------------------------------------------------
  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true)
      //
      //  Get the data - selection
      //
      let rows
      if (tableColumn) {
        //
        // Clear the dropdown options if the value is invalid
        //
        if (!tableColumnValue) {
          setDropdownOptions([])
          return
        }
        rows = await table_fetch({
          table: table,
          whereColumnValuePairs: [{ column: tableColumn, value: tableColumnValue }],
          orderBy: orderBy
        })
      }
      //
      //  No selection
      //
      else {
        rows = await table_fetch({
          table: table,
          orderBy: orderBy
        })
      }
      //
      // Map rows into the structure expected by DropdownSearch
      //
      const options = rows.map(row => ({
        value: row[optionValue],
        label: row[optionLabel]
      }))
      //
      // Optionally add a blank option if includeBlank is true
      //
      if (includeBlank) {
        setDropdownOptions([{ value: '', label: '' }, ...options])
      } else {
        setDropdownOptions(options)
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    } finally {
      setLoading(false)
    }
  }, [table, orderBy, optionLabel, optionValue, tableColumn, tableColumnValue, includeBlank])

  //
  // Fetch options from the database
  //
  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  //---------------------------------------------------------------------
  //
  //  Determine if data fetched
  //
  if (loading) return <p className='font-medium'>Loading options...</p>

  if (dropdownOptions.length === 0) {
    return <p className='font-medium'>No options available</p>
  }

  //---------------------------------------------------------------------
  //  Return dropdown
  //---------------------------------------------------------------------
  return (
    <div>
      <DropdownSearch
        label={label}
        name={name}
        options={dropdownOptions}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        searchEnabled={searchEnabled}
        dropdownWidth={dropdownWidth}
      />
    </div>
  )
}
