import QuizBiddingTableHeader from './QuizBiddingTableHeader'
import QuizBiddingTableLine from './QuizBiddingTableLine'
import { QuestionsTable } from '@/app/lib/definitions'

interface QuizBiddingProps {
  question: QuestionsTable
}

export default function QuizBidding({ question }: QuizBiddingProps): JSX.Element | null {
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <div className='rounded-md bg-gray-50 p-1 md:p-2'>
      <p className='text-lg font-semibold text-left'>Bidding</p>
      <table>
        <QuizBiddingTableHeader />
        <tbody>
          {question?.qrounds?.map((round, idx) => (
            <QuizBiddingTableLine key={idx} idx={idx} round={round} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
