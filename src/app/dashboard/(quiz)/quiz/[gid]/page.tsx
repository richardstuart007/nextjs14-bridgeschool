import Form from '@/src/app/dashboard/(quiz)/quiz/[gid]/ui/form'
import Breadcrumbs from '@/src/ui/utils/breadcrumbs'
import { fetchQuestionsByGid } from '@/src/lib/data/tables/questions'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { table_Questions } from '@/src/lib/definitions'

export const metadata: Metadata = {
  title: 'Quiz'
}

export default async function Page({ params }: { params: { gid: number } }) {
  //
  //  Variables used in the return statement
  //
  const gid: number = params.gid
  let questions: table_Questions[] = []
  try {
    //
    //  Get Questions
    //
    const questionsData = await fetchQuestionsByGid(gid)
    if (!questionsData) notFound()
    questions = questionsData
  } catch (error) {
    console.error('An error occurred while fetching data:', error)
  }
  //---------------------------------------------------
  return (
    <div className='w-full md:p-6'>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Library', href: '/dashboard/library' },
          {
            label: 'Quiz',
            href: `/dashboard/quiz/${gid}`,
            active: true
          }
        ]}
      />
      <Form questions={questions} />
    </div>
  )
}
