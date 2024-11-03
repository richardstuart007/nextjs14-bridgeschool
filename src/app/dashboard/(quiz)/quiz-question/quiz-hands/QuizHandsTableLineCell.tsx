interface QuizHandsTableLineCellProps {
  cellValue: string | null
}

export default function QuizHandsTableLineCell({
  cellValue
}: QuizHandsTableLineCellProps): JSX.Element {
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <td className='whitespace-nowrap'>
      <div className='flex items-center justify-center'>{cellValue}</div>
    </td>
  )
}
