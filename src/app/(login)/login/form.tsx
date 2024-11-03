'use client'

import { lusitana } from '@/src/fonts'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/src/ui/utils/button'
import { useFormState } from 'react-dom'
import { loginUser } from '@/src/lib/actions/user/user-login'
import { usePathname, useRouter } from 'next/navigation'
import { deleteCookie } from '@/src/lib/data/data-cookie'
import Socials from '@/src/app/(login)/login/socials'
import { useState, useEffect } from 'react'

export default function LoginForm() {
  //
  //  Router
  //
  const router = useRouter()
  //
  //  Get Pathname
  //
  const pathname = usePathname()
  //
  //  State
  //
  const initialState = { message: null, errors: {} }
  const [formState, formAction] = useFormState(loginUser, initialState)
  const errorMessage = formState?.message || null
  //
  // Local state to manage submitting status
  //
  const [submitting, setSubmitting] = useState(false)
  //
  //  Error message on submission
  //
  useEffect(() => {
    if (errorMessage) setSubmitting(false)
  }, [errorMessage])
  //
  //  One time only
  //
  useEffect(() => {
    deleteCookie()
    // eslint-disable-next-line
  }, [])
  //
  //  Change of pathname
  //
  useEffect(() => {
    pathChange()
    // eslint-disable-next-line
  }, [pathname])
  //--------------------------------------------------------------------------------
  //  Every Time
  //--------------------------------------------------------------------------------
  function pathChange() {
    //
    //  Auth redirect error - fix ???
    //
    if (!pathname.includes('/login')) {
      // console.log('router.push /login')
      router.push('/login')
    }
  }
  //-------------------------------------------------------------------------
  //  Login Button
  //-------------------------------------------------------------------------
  function LoginButton() {
    return (
      <Button className='mt-4 w-full flex justify-center' disabled={submitting} type='submit'>
        {submitting ? 'Logging In...' : 'Login'}
      </Button>
    )
  }
  //-------------------------------------------------------------------------
  //  Go to Register
  //-------------------------------------------------------------------------
  interface RegisterButtonProps {
    onClick: () => void
  }
  function RegisterButton({ onClick }: RegisterButtonProps) {
    return (
      <Button
        className='mt-4 w-full flex items-center justify-center bg-gray-300 border-none shadow-noneunderline  hover:bg-gray-500'
        onClick={onClick}
      >
        Not Registered yet? Click here
      </Button>
    )
  }
  //--------------------------------------------------------------------------------
  //  Register User
  //--------------------------------------------------------------------------------
  function onClick_registration() {
    router.push('/register')
  }
  //-------------------------------------------------------------------------
  //  Handle Login
  //-------------------------------------------------------------------------
  const onSubmit_login = () => {
    setSubmitting(true)
    if (formState) formState.message = null
  }
  //--------------------------------------------------------------------------------
  return (
    <form action={formAction} className='space-y-3' onSubmit={onSubmit_login}>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className={`${lusitana.className} mb-3 text-2xl  text-orange-500`}>Login</h1>
        {/* -------------------------------------------------------------------------------- */}
        {/* email   */}
        {/* -------------------------------------------------------------------------------- */}
        <div>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <input
              className='peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500'
              id='email'
              type='email'
              name='email'
              placeholder='Enter your email address'
              autoComplete='email'
              required
              disabled={submitting}
            />
          </div>
        </div>
        {/* -------------------------------------------------------------------------------- */}
        {/* password                                                                         */}
        {/* -------------------------------------------------------------------------------- */}
        <div className='mt-4'>
          <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='password'>
            Password
          </label>
          <div className='relative'>
            <input
              className='peer block w-full rounded-md border border-gray-200 py-[9px] text-sm outline-2 placeholder:text-gray-500'
              id='password'
              type='password'
              name='password'
              placeholder='Enter password'
              autoComplete='current-password'
              required
              disabled={submitting}
            />
          </div>
        </div>
        {/* -------------------------------------------------------------------------------- */}
        {/* Errors                                                */}
        {/* -------------------------------------------------------------------------------- */}
        <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
          {errorMessage && (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
              <p className='text-sm text-red-500'>{errorMessage}</p>
            </>
          )}
        </div>
        {/* -------------------------------------------------------------------------------- */}
        {/* buttons */}
        {/* -------------------------------------------------------------------------------- */}
        <LoginButton />
        {!submitting && <Socials />}
        {!submitting && <RegisterButton onClick={onClick_registration} />}
      </div>
    </form>
  )
}
