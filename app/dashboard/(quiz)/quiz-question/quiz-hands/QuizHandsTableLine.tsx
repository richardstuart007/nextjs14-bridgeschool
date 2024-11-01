import QuizHandsTableLineCell from './QuizHandsTableLineCell'
interface handObj {
  position: string
  hand: string[]
}

interface QuizHandsTableLineProps {
  handObj: handObj
  idx: number
}
//...................................................................................
//.  Main Line
//...................................................................................
export default function QuizHandsTableLine({ handObj, idx }: QuizHandsTableLineProps): JSX.Element {
  //
  //  Destructure props
  //
  const { position, hand } = handObj
  //
  //  Strip 'n' and replace with null
  //
  for (let i = 0; i < 4; i++) {
    if (hand[i] === 'n' || hand[i] === 'N') hand[i] = ''
  }
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <tr key={idx}>
      <QuizHandsTableLineCell cellValue={position} />
      <QuizHandsTableLineCell cellValue={hand[0]} />
      <QuizHandsTableLineCell cellValue={hand[1]} />
      <QuizHandsTableLineCell cellValue={hand[2]} />
      <QuizHandsTableLineCell cellValue={hand[3]} />
    </tr>
  )
}
