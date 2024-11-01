import QuizHandsTableHeader from './QuizHandsTableHeader'
import QuizHandsTableLine from './QuizHandsTableLine'
import { QuestionsTable } from '@/app/lib/definitions'

interface handObj {
  position: string
  hand: string[]
}

interface QuizHandsProps {
  question: QuestionsTable
}

export default function QuizHands({ question }: QuizHandsProps): JSX.Element | null {
  //
  //  No Hands
  //
  if (!question.qnorth && !question.qeast && !question.qsouth && !question.qwest) return null
  //
  //  Build HandObj Array - N/E/S/W
  //
  let HandObjArray = []
  let RowCount = 0
  //
  //  North
  //
  if (question.qnorth) {
    RowCount++
    const handObj: handObj = {
      position: 'North',
      hand: []
    }
    handObj.hand = [...question.qnorth]
    HandObjArray.push(handObj)
  }
  //
  //  East
  //
  if (question.qeast) {
    RowCount++
    const handObj: handObj = {
      position: 'East',
      hand: []
    }
    handObj.hand = [...question.qeast]
    HandObjArray.push(handObj)
  }
  //
  //  South
  //
  if (question.qsouth) {
    RowCount++
    const handObj: handObj = {
      position: 'South',
      hand: []
    }
    handObj.hand = [...question.qsouth]
    HandObjArray.push(handObj)
  }
  //
  //  West
  //
  if (question.qwest) {
    RowCount++
    const handObj: handObj = {
      position: 'West',
      hand: []
    }
    handObj.hand = [...question.qwest]
    HandObjArray.push(handObj)
  }
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <div className='rounded-md bg-gray-50 p-1 md:p-2'>
      <p className='text-lg font-semibold text-left'>Hands</p>
      <table>
        <QuizHandsTableHeader />
        <tbody>
          {HandObjArray.map((handObj, idx) => (
            <QuizHandsTableLine key={idx} idx={idx} handObj={handObj} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
