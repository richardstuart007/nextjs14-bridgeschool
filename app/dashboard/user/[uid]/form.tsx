'use client'
import { useState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '../../../ui/utils/button'
import { useFormState, useFormStatus } from 'react-dom'
import { UserEdit } from '@/app/lib/actions/user-edit'
import type { UsersTable } from '@/app/lib/definitions'
import SelectCountry from '@/app/ui/countries/select-country'

export default function Form({ UserRecord }: { UserRecord: UsersTable }) {
  const initialState = { message: null, errors: {} }
  const [formState, formAction] = useFormState(UserEdit, initialState)
  const [u_name, setU_name] = useState(UserRecord.u_name)
  const [u_fedid, setU_fedid] = useState(UserRecord.u_fedid)
  const [u_fedcountry, setU_fedcountry] = useState(UserRecord.u_fedcountry)
  const u_uid = UserRecord.u_uid
  const u_email = UserRecord.u_email
  //-------------------------------------------------------------------------
  //  Update Button
  //-------------------------------------------------------------------------
  function UpdateButton() {
    const { pending } = useFormStatus()
    return (
      <Button className='mt-4 w-72 md:max-w-md px-4' aria-disabled={pending}>
        Update
      </Button>
    )
  }
  //...................................................................................
  //.  Select Country
  //...................................................................................
  function handleSelectCountry(CountryCode: string) {
    //
    //  Update values
    //
    setU_fedcountry(CountryCode)
  }
  //-------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        <div className=''>
          {/*  ...................................................................................*/}
          {/*  User ID  */}
          {/*  ...................................................................................*/}
          <div>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='u_uid'>
              ID:{u_uid} Email:{u_email}
            </label>
            <div className='relative'>
              <input id='u_uid' type='hidden' name='u_uid' value={u_uid} />
            </div>
          </div>
          {/*  ...................................................................................*/}
          {/*  Name */}
          {/*  ...................................................................................*/}
          <div>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='u_name'>
              Name
            </label>
            <div className='relative'>
              <input
                className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
                id='u_name'
                type='u_name'
                name='u_name'
                autoComplete='u_name'
                required
                value={u_name}
                onChange={e => setU_name(e.target.value)}
              />
            </div>
          </div>
          <div id='name-error' aria-live='polite' aria-atomic='true'>
            {formState.errors?.u_name &&
              formState.errors.u_name.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                  {error}
                </p>
              ))}
          </div>
          {/*  ...................................................................................*/}
          {/*  FEDID  */}
          {/*  ...................................................................................*/}
          <div className='mt-4'>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='u_fedid'>
              Bridge Federation ID
            </label>
            <div className='relative'>
              <input
                className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
                id='u_fedid'
                type='u_fedid'
                name='u_fedid'
                autoComplete='u_fedid'
                required
                value={u_fedid}
                onChange={e => setU_fedid(e.target.value)}
              />
            </div>
          </div>
          <div id='fedid-error' aria-live='polite' aria-atomic='true'>
            {formState.errors?.u_fedid &&
              formState.errors.u_fedid.map((error: string) => (
                <p className='mt-2 text-sm text-red-500' key={error}>
                  {error}
                </p>
              ))}
          </div>
          {/*  ...................................................................................*/}
          {/*  FEDCOUNTRY  */}
          {/*  ...................................................................................*/}
          <div className='mt-4'>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='u_fedcountry'
            >
              Bridge Federation Country ({u_fedcountry})
            </label>
            <input
              className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='u_fedcountry'
              type='hidden'
              name='u_fedcountry'
              value={u_fedcountry}
            />
            <SelectCountry onChange={handleSelectCountry} countryCode={u_fedcountry ?? ''} />
          </div>
          {/*  ...................................................................................*/}
          {/*   Update Button */}
          {/*  ...................................................................................*/}
          <UpdateButton />
          {/*  ...................................................................................*/}
          {/*   Error Messages */}
          {/*  ...................................................................................*/}
          <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
            {formState.message && (
              <>
                <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
                <p className='text-sm text-red-500'>{formState.message}</p>
              </>
            )}
          </div>
          {/*  ...................................................................................*/}
        </div>
      </div>
    </form>
  )
}
