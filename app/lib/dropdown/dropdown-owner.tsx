import { useEffect, useState } from 'react'
import DropdownSearch from '@/app/lib/dropdown/dropdown'
import { fetch_owner } from '@/app/lib/data/tables/owner'

type DropdownProps = {
  selectedOption: string
  setSelectedOption: (value: string) => void
  name: string
}

export default function DropdownOwner({ selectedOption, setSelectedOption, name }: DropdownProps) {
  const [dropdownOptions, setDropdownOptions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  //
  // Options for the dropdown
  //
  const label = 'Owner'
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
      const rows = await fetch_owner()
      //
      // Map rows into the structure expected by DropdownSearch
      //
      const options = rows.map(row => ({
        value: row.oowner,
        label: row.otitle
      }))

      // Set the mapped options to the state
      setDropdownOptions(options)
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
