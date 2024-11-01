import Image from 'next/image'
interface QuizBiddingTableLineCellProps {
  bid: string | null
  suit: string | null
}

export default function QuizBiddingTableLineCell({
  bid,
  suit
}: QuizBiddingTableLineCellProps): JSX.Element {
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <td className='whitespace-nowrap'>
      <div className='flex items-center justify-center'>
        {/*  Bid                */}
        {bid}

        {/*  Suit Symbol            */}
        {suit !== null && (
          <div>
            {suit === 'S' ? (
              <Image src='/suits/spade.svg' width={15} height={15} alt='spade' />
            ) : suit === 'H' ? (
              <Image src='/suits/heart.svg' width={15} height={15} alt='heart' />
            ) : suit === 'D' ? (
              <Image src='/suits/diamond.svg' width={15} height={15} alt='diamond' />
            ) : suit === 'C' ? (
              <Image src='/suits/club.svg' width={15} height={15} alt='club' />
            ) : null}
          </div>
        )}
      </div>
    </td>
  )
}
