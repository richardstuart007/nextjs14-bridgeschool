import { useState, useEffect } from 'react'

type DropdownProps = {
  label: string
  name: string
  options: { value: string; label: string }[]
  selectedOption: string
  setSelectedOption: (value: string) => void
  searchEnabled?: boolean
}

export default function DropdownSearch({
  label,
  name,
  options,
  selectedOption,
  setSelectedOption,
  searchEnabled = true
}: DropdownProps) {
  const [searchTerm, setSearchTerm] = useState<string>('')
  //
  // Filter options based on search term
  //
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  //
  // Set default value to the first filtered option when options are available or change
  //
  useEffect(() => {
    if (!selectedOption && filteredOptions.length > 0) {
      setSelectedOption(filteredOptions[0].value)
    }
  }, [filteredOptions, selectedOption, setSelectedOption])
  return (
    <div className='mt-2'>
      {/*  ...................................................................................*/}
      {/* Label for the dropdown */}
      {/*  ...................................................................................*/}
      <label className=' block text-xs font-medium text-gray-900 mb-1' htmlFor={name}>
        {label}
      </label>
      {/*  ...................................................................................*/}
      {/* Search Input */}
      {/*  ...................................................................................*/}
      {searchEnabled && (
        <input
          className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
          type='text'
          placeholder='Search...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      )}
      {/*  ...................................................................................*/}
      {/* Dropdown */}
      {/*  ...................................................................................*/}
      <div className='relative'>
        <select
          className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm'
          id={name}
          name={name}
          value={selectedOption}
          onChange={e => setSelectedOption(e.target.value)}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            <option value=''>No options found</option>
          )}
        </select>
      </div>
      {/*  ...................................................................................*/}
    </div>
  )
}
