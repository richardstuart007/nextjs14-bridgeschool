import { useEffect, useState } from 'react'
import DropdownSearch from '@/src/ui/utils/dropdown/dropdown'
import { table_fetch } from '@/src/lib/tables/table_fetch'

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
  console.log('owner', owner)
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
      const fetchParams = {
        table: 'ownergroup',
        columnValuePairs: [{ column: 'ogowner', value: owner }]
      }
      const rows = await table_fetch(fetchParams)
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
