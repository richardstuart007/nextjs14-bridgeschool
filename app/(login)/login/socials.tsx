'use client'
import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'

import { Button } from '../../ui/utils/button'
import { Routes_AfterLogin_redirect } from '@/routes'
export default function Socials() {
  //
  //  Signin using provider
  //
  const signInProvider = (provider: 'google' | 'github') => {
    signIn(provider, {
      callbackUrl: Routes_AfterLogin_redirect
    })
  }
  return (
    <>
      <label className='mb-0 mt-9 block text-xs font-medium text-gray-900' htmlFor='email'>
        Socials
      </label>
      <div className='flex items-center w-full pt-4 gap-x-6'>
        <Button
          className='w-full border border-orange-300 rounded-lg bg-orange-300 hover:bg-orange-500 flex items-center justify-center'
          onClick={() => signInProvider('google')}
        >
          <FcGoogle className='h-8 w-8' />
        </Button>
        <Button
          className='w-full border border-orange-300 rounded-lg bg-orange-300 hover:bg-orange-500 flex items-center justify-center'
          onClick={() => signInProvider('github')}
        >
          <FaGithub className='h-8 w-8' />
        </Button>
      </div>
    </>
  )
}
