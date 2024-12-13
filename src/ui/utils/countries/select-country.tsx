import { useState, useEffect } from 'react'
import { COUNTRIES } from './countries'

interface Props {
  onChange: (code: string) => void
  countryCode: string
}
interface Country {
  code: string
  label: string
  phone: string
}
export default function SelectCountry({ onChange, countryCode }: Props): JSX.Element {
  //
  // Sort the countries array by label
  //
  COUNTRIES.sort((a, b) => a.label.localeCompare(b.label))
  //
  //  Find country or default
  //
  const getDefaultCountry = (code: string): Country => {
    let countryInit = COUNTRIES.find(country => country.code === code)
    return countryInit ?? { code: 'ZZ', label: 'World', phone: '999' }
  }
  //
  //  State
  //
  const [country, setCountry] = useState<Country>(getDefaultCountry(countryCode))
  //
  // Use useEffect to update the state when countryCode prop changes
  //
  useEffect(() => {
    setCountry(getDefaultCountry(countryCode))
  }, [countryCode])
  //-----------------------------------------------------------------------------------
  //  Country Change Handler
  //-----------------------------------------------------------------------------------
  function handleCountryChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    //
    //  Find the selected country
    //
    const selectedCountryCode = event.target.value
    const selectedCountry = COUNTRIES.find(country => country.code === selectedCountryCode)
    //
    //  Update state
    //
    setCountry(selectedCountry as Country)
    //
    //  Call the parent onChange function
    //
    if (selectedCountry) onChange(selectedCountry.code)
  }
  //...................................................................................
  return (
    <div className='flex justify-left'>
      <select
        value={country.code}
        onChange={handleCountryChange}
        className='w-72 px-4 py-[9px] border border-gray-200 rounded-md text-sm outline-2 focus:outline-none focus:ring focus:ring-blue-200'
      >
        {COUNTRIES.map(option => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
