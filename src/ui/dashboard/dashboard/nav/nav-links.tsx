'use client'
import { useEffect, useState, ForwardRefExoticComponent, SVGProps, RefAttributes } from 'react'
import {
  BuildingLibraryIcon,
  HomeIcon,
  ArchiveBoxIcon,
  UserIcon,
  Cog6ToothIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { structure_SessionsInfo } from '@/src/lib/tables/structures'

interface FormProps {
  sessionInfo: structure_SessionsInfo
}
export default function NavLinks(props: FormProps): JSX.Element {
  //
  //  Deconstruct props
  //
  const sessionInfo = props.sessionInfo
  const { bsuid, bsid, bsadmin } = sessionInfo
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
    const hrefUser = `/dashboard/user/${bsuid}`
    const hrefSession = `/dashboard/session/${bsid}`
    const hrefLibrary = `/dashboard/library`
    const hrefHistory = `/dashboard/history/${bsuid}`
    const hrefAdmin = `/admin`
    //
    //  Base links
    //
    const links_base = [
      { name: 'Home', href: '/dashboard', icon: HomeIcon },
      { name: 'Library', href: hrefLibrary, icon: BuildingLibraryIcon },
      { name: 'History', href: hrefHistory, icon: ArchiveBoxIcon },
      { name: 'User', href: hrefUser, icon: UserIcon },
      { name: 'Session', href: hrefSession, icon: Cog6ToothIcon }
    ]
    //
    //  Links authorised to Admin users only
    //
    const links_admin = [{ name: 'Admin', href: hrefAdmin, icon: CircleStackIcon }]
    const linksupdate = bsadmin ? links_base.concat(links_admin) : links_base
    //
    //  Update the links
    //
    setLinks(linksupdate)
  }, [bsuid, bsid, bsadmin])
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
