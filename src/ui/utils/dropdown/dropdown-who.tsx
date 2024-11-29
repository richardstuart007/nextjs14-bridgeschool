import { useEffect, useState } from 'react'
import DropdownSearch from '@/src/ui/utils/dropdown/dropdown'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'

type DropdownProps = {
  selectedOption: string
  setSelectedOption: (value: string) => void
  name: string
}

export default function DropdownWho({ selectedOption, setSelectedOption, name }: DropdownProps) {
  const [dropdownOptions, setDropdownOptions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  //
  // Options for the dropdown
  //
  const label = 'Who'
  //
  // Fetch options from the database
  //
  useEffect(() => {
    fetchOptions()
  }, [])
  //---------------------------------------------------------------------
  //  Load dropdown options from the database
  //---------------------------------------------------------------------
  async function fetchOptions() {
    try {
      //
      //  Get the data
      //
      const fetchParams = {
        table: 'who',
        orderBy: 'wwho'
      }
      const rows = await table_fetch(fetchParams)
      //
      // Map rows into the structure expected by DropdownSearch
      //
      const options = rows.map(row => ({
        value: row.wwho,
        label: row.wtitle
      }))

      // Set the mapped options to the state
      setDropdownOptions(options)
      //
      //  Errors
      //
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    } finally {
      setLoading(false)
    }
  }
  //---------------------------------------------------------------------
  //
  //  Determine if data fetched
  //
  if (loading) return null
  //
  //  Return dropdown
  //
  return (
    <div>
      <DropdownSearch
        label={label}
        name={name}
        options={dropdownOptions}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        searchEnabled={false}
      />
    </div>
  )
}
