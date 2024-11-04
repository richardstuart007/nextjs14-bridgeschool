'use client'
import { useState } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormState, useFormStatus } from 'react-dom'
import { OwnerMaint } from '@/src/lib/actions/admin/owner-maint'
import type { table_Owner } from '@/src/lib/definitions'

interface FormProps {
  ownerRecord: table_Owner | null
  onSuccess: () => void
  shouldCloseOnUpdate?: boolean
}

export default function Form({ ownerRecord, onSuccess, shouldCloseOnUpdate = true }: FormProps) {
  const initialState = { message: null, errors: {}, databaseUpdated: false }
  const [formState, formAction] = useFormState(OwnerMaint, initialState)
  //
  //  State and Initial values
  //
  const ooid = ownerRecord?.ooid || 0
  const [oowner, setoowner] = useState(ownerRecord?.oowner || '')
  const [otitle, setotitle] = useState(ownerRecord?.otitle || '')
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
        {ooid === 0 ? 'Create' : 'Update'}
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
          {ooid !== 0 && (
            <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='ooid'>
              ID: {ooid}
            </label>
          )}
          <input id='ooid' type='hidden' name='ooid' value={ooid} />
        </div>
        {/*  ...................................................................................*/}
        {/*   Owner */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='oowner'>
            Owner
          </label>
          <div className='relative'>
            {ooid === 0 ? (
              <input
                className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm'
                id='oowner'
                type='oowner'
                name='oowner'
                value={oowner}
                onChange={e => setoowner(e.target.value)}
              />
            ) : (
              /* -----------------Edit ------------------*/
              <>
                <span className='block w-72 md:max-w-md px-4 rounded-md bg-gray-200 border-none py-[9px] text-sm'>
                  {oowner}
                </span>
                <input id='oowner' type='hidden' name='oowner' value={oowner} />
              </>
            )}
          </div>
        </div>
        {/*   Errors */}
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.oowner &&
            formState.errors.oowner.map((error: string) => (
              <p className='mt-2 text-sm text-red-500' key={error}>
                {error}
              </p>
            ))}
        </div>

        {/*  ...................................................................................*/}
        {/*   Title */}
        {/*  ...................................................................................*/}
        <div className='mt-2'>
          <label className='mb-1 mt-5 block text-xs font-medium text-gray-900' htmlFor='otitle'>
            Title
          </label>
          <div className='relative'>
            <input
              className='w-72 md:max-w-md px-4 rounded-md border border-blue-500 py-[9px] text-sm '
              id='otitle'
              type='otitle'
              name='otitle'
              value={otitle}
              onChange={e => setotitle(e.target.value)}
            />
          </div>
        </div>
        <div id='fedid-error' aria-live='polite' aria-atomic='true'>
          {formState.errors?.otitle &&
            formState.errors.otitle.map((error: string) => (
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
