import ReviewForm from '@/app/dashboard/(quiz)/quiz-review/[hid]/ui/form'
import Breadcrumbs from '@/app/ui/utils/breadcrumbs'
import { fetchQuestionsByGid } from '@/app/lib/data/tables/questions'
import { fetchHistoryById } from '@/app/lib/data/tables/usershistory'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { QuestionsTable, UsershistoryTable } from '@/app/lib/definitions'

export const metadata: Metadata = {
  title: 'Quiz Review'
}

export default async function Page({ params }: { params: { hid: number } }) {
  //
  //  Variables used in the return statement
  //
  const hid: number = params.hid
  try {
    //
    //  Get History
    //
    const history: UsershistoryTable = await fetchHistoryById(hid)
    if (!history) {
      notFound()
    }
    //
    //  Get Questions
    //
    const qgid = history.r_gid
    const questions_gid: QuestionsTable[] = await fetchQuestionsByGid(qgid)
    if (!questions_gid || questions_gid.length === 0) {
      notFound()
    }
    //
    //  Strip out questions not answered
    //
    let questions: QuestionsTable[] = []
    const qid = history.r_qid
    qid.forEach(qid => {
      const questionIndex = questions_gid.findIndex(q => q.qqid === qid)
      questions.push(questions_gid[questionIndex])
    })
    return (
      <div className='w-full md:p-6'>
        <Breadcrumbs
          breadcrumbs={[
            { label: 'History', href: '/dashboard/history' },
            {
              label: 'Quiz-Review',
              href: `/dashboard/quiz-review/${hid}`,
              active: true
            }
          ]}
        />
        {questions ? <ReviewForm history={history} questions={questions} /> : null}
      </div>
    )
  } catch (error) {
    console.error('An error occurred while fetching history data:', error)
    return <div>An error occurred while fetching history data.</div>
  }
}
