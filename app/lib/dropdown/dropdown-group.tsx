import { useEffect, useState } from 'react'
import DropdownSearch from '@/app/lib/dropdown/dropdown'
import { fetch_ownergroup } from '@/app/lib/data/tables/ownergroup'

type DropdownProps = {
  selectedOption: string
  setSelectedOption: (value: string) => void
  name: string
  owner: string
}

export default function DropdownOwnerGroup({
  selectedOption,
  setSelectedOption,
  name,
  owner
}: DropdownProps) {
  const [dropdownOptions, setDropdownOptions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  //
  // Options for the dropdown
  //
  const label = 'Owner Groups'
  //
  // Fetch options from the database
  //
  useEffect(() => {
    fetchOptions(owner)
  }, [owner])

  //---------------------------------------------------------------------
  //  Load dropdown options from the database
  //---------------------------------------------------------------------
  async function fetchOptions(owner: string) {
    try {
      //
      //  Get the data
      //
      const rows = await fetch_ownergroup(owner)
      //
      // Map rows into the structure expected by DropdownSearch
      //
      const options = rows.map(row => ({
        value: row.oggroup,
        label: row.ogtitle
      }))
      // console.log('options', options)
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
        searchEnabled={true}
      />
    </div>
  )
}
