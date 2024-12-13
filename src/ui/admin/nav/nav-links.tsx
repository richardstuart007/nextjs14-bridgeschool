'use client'
<<<<<<< HEAD
import { useEffect, useState, ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'
import { HomeIcon, CircleStackIcon } from '@heroicons/react/24/outline'
=======
import { useEffect, useState } from 'react'
>>>>>>> dev
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function Page() {
  //
  // Define the Link type
  //
  type Link = {
    name: string
    href: string
  }
  //
  // Links with hrefUser
  //
  const [links, setLinks] = useState<Link[]>([])
  useEffect(() => {
    const hrefAdmin = `/admin`
    const initialLinks = [
<<<<<<< HEAD
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Admin', href: hrefAdmin, icon: CircleStackIcon }
=======
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Admin', href: hrefAdmin }
>>>>>>> dev
    ]
    setLinks(initialLinks)
  }, [])
  //
  //  Get path name
  //
  const pathname = usePathname()
  //--------------------------------------------------------------------------------
  return (
    <>
      {links.map(link => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-15 grow items-center justify-center gap-2 rounded-md bg-gray-50 p-1 text-xs font-medium hover:bg-sky-200 hover:text-red-600 md:flex-none md:p-2 md:px-2',
              {
                'bg-sky-100 text-blue-600': pathname === link.href
              }
            )}
          >
            <p className='text-xs'>{link.name}</p>
          </Link>
        )
      })}
    </>
  )
}
