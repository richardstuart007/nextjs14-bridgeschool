'use client'
import { useEffect, useState, ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'
import {
  HomeIcon,
  UserIcon,
  CircleStackIcon,
  BuildingLibraryIcon,
  ServerStackIcon,
  RectangleGroupIcon,
  UserCircleIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
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
    icon: ForwardRefExoticComponent<
      Omit<SVGProps<SVGSVGElement>, 'ref'> & {
        title?: string
        titleId?: string
      } & RefAttributes<SVGSVGElement>
    >
  }
  //
  // Links with hrefUser
  //
  const [links, setLinks] = useState<Link[]>([])
  useEffect(() => {
    const hrefUser = `/admin/users`

    const hrefOwner = `/admin/owner`
    const hrefOwnergroup = `/admin/ownergroup`
    const hrefLibrary = `/admin/library`
    const hrefWho = `/admin/who`
    const hrefReftype = `/admin/reftype`
    const hrefQuestions = `/admin/questions`
    const hrefAdmin = `/admin`
    const initialLinks = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Owner', href: hrefOwner, icon: ServerStackIcon },
      { name: 'Ownergroup', href: hrefOwnergroup, icon: RectangleGroupIcon },
      { name: 'Library', href: hrefLibrary, icon: BuildingLibraryIcon },
      { name: 'Who', href: hrefWho, icon: UserCircleIcon },
      { name: 'Reftype', href: hrefReftype, icon: DocumentTextIcon },
      { name: 'Questions', href: hrefQuestions, icon: QuestionMarkCircleIcon },
      { name: 'Users', href: hrefUser, icon: UserIcon },
      { name: 'Admin', href: hrefAdmin, icon: CircleStackIcon }
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
        const LinkIcon = link.icon
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href
              }
            )}
          >
            <LinkIcon className='w-6' />
            <p className='hidden md:block'>{link.name}</p>
          </Link>
        )
      })}
    </>
  )
}
