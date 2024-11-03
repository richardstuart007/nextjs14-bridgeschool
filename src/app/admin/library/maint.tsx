'use client'
import { useState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormState, useFormStatus } from 'react-dom'
import { LibraryMaint } from '@/src/lib/actions/admin/library-maint'
import type { table_Library } from '@/src/lib/definitions'
import DropdownType from '@/src/lib/dropdown/dropdown-type'
import DropdownOwner from '@/src/lib/dropdown/dropdown-owner'
import DropdownWho from '@/src/lib/dropdown/dropdown-who'
import DropdownOwnerGroup from '@/src/lib/dropdown/dropdown-group'

interface FormProps {
  libraryRecord: table_Library | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ libraryRecord, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useFormState(LibraryMaint, initialState)
  //
  //  State and Initial values
  //
  const lrlid = libraryRecord?.lrlid || 0
  const [lrowner, setLrowner] = useState(libraryRecord?.lrowner || 'Richard')
  const [lrgroup, setLrgroup] = useState(libraryRecord?.lrgroup || '')
  const [lrref, setLrref] = useState(libraryRecord?.lrref || '')
  const [lrdesc, setLrdesc] = useState(libraryRecord?.lrdesc || '')
  const [lrwho, setLrwho] = useState(libraryRecord?.lrwho || '')
  const [lrtype, setLrtype] = useState(libraryRecord?.lrtype || '')
  const [lrlink, setLrlink] = useState(libraryRecord?.lrlink || '')
  //-------------------------------------------------------------------------
  //  Update Button
  //-------------------------------------------------------------------------
  function UpdateButton() {
    //
    //  Display the button
    //
    const { pending } = useFormStatus()
    return (
      <Button className='mt-2 w-72 md:max-w-md px-4' aria-disabled={pending}>
        {lrlid === 0 ? 'Create' : 'Update'}
      </Button>
    )
  }
  //-------------------------------------------------------------------------
  //
  // Close the popup if the update was successful
  //
  // console.log('formState', formState)
  if (formState.databaseUpdated && shouldCloseOnUpdate) {
    onSuccess()
    return null
  }

  return (
    <form action={formAction} className='space-y-3 '>
      <div className='flex-1 rounded-lg bg-gray-50 px-4 pb-2 pt-2 max-w-md'>
        {/*  ...................................................................................*/}
        {/*  ID  */}
        {/*  ...................................................................................*/}
        <div>
          {lrlid !== 0 && (
            <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='lrlid'>
              ID: {lrlid}
            </label>
          )}
          <input id='lrlid' type='hidden' name='lrlid' value={lrlid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <DropdownOwner selectedOption={lrowner} setSelectedOption={setLrowner} name={'lrowner'} />
        {/*  ...................................................................................*/}
        {/*   Owner Group */}
        {/*  ...................................................................................*/}
        <DropdownOwnerGroup
          selectedOption={lrgroup}
          setSelectedOption={setLrgroup}
          name={'lrgroup'}
          owner={lrowner}
        />
        {/*  ...................................................................................*/}
        {/*   Reference */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='lrref'>
            Reference
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='lrref'
              type='lrref'
              name='lrref'
              value={lrref}
              onChange={e => setLrref(e.target.value)}
            />
          </div>
        </div>
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.lrref &&
            formState.errors.lrref.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*  Description */}
        {/*  ...................................................................................*/}
        <div>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='lrdesc'>
            Description
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='lrdesc'
              type='lrdesc'
              name='lrdesc'
              value={lrdesc}
              onChange={e => setLrdesc(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.lrdesc &&
            formState.errors.lrdesc.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*  Who  */}
        {/*  ...................................................................................*/}
        <DropdownWho selectedOption={lrwho} setSelectedOption={setLrwho} name={'lrwho'} />
        {/*  ...................................................................................*/}
        {/*  Type  */}
        {/*  ...................................................................................*/}
        <DropdownType selectedOption={lrtype} setSelectedOption={setLrtype} name={'lrtype'} />
        {/*  ...................................................................................*/}
        {/*  Link */}
        {/*  ...................................................................................*/}
        <div>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='lrlink'>
            Link
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='lrlink'
              type='lrlink'
              name='lrlink'
              value={lrlink}
              onChange={e => setLrlink(e.target.value)}
            />
          </div>
        </div>
        <div id='name-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.lrlink &&
            formState.errors.lrlink.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
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
    </form>
  )
}
