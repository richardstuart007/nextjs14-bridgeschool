import Form from '@/src/app/dashboard/user/[uid]/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { fetchUserById } from '@/src/lib/data/tables/users'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Users } from '@/src/lib/definitions'

export const metadata: Metadata = {
  title: 'User'
}
export default async function Page({ params }: { params: { uid: number } }) {
  //
  //  Variables used in the return statement
  //
  let uid: number = params.uid
  let UserRecord: table_Users | null = null
  //
  //  Get User Info
  //
  try {
    const data = await fetchUserById(uid)
    if (!data) notFound()
    UserRecord = data
  } catch (error) {
    console.error('An error occurred while fetching data:', error)
  }
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          {
            label: 'User',
            href: `/dashboard/user/${uid}`,
            active: true
          }
        ]}
      />
      {UserRecord ? <Form UserRecord={UserRecord} /> : null}
    </div>
  )
}
