import QuizBiddingTableLineCell from './QuizBiddingTableLineCell'

interface QuizBiddingTableLineProps {
  round: string[]
  idx: number
}
//...................................................................................
//.  Main Line
//...................................................................................
export default function QuizBiddingTableLine(props: QuizBiddingTableLineProps): JSX.Element {
  const { round, idx } = props

  const bids: (string | null)[] = []
  const suits: (string | null)[] = []
  //
  //.  Load a round
  //
  round.forEach(bidsuit => {
    analyseBid(bidsuit)
  })
  //...................................................................................
  //.  Analyse the bid
  //...................................................................................
  function analyseBid(bidsuit: string) {
    //
    //  Passed is not a string
    //
    if (typeof bidsuit !== 'string') {
      bids.push(null)
      suits.push(null)
      return
    }
    //
    //  Default (bid and suit)
    //
    let bid: string | null = bidsuit.substring(0, 1)
    let suit: string | null = bidsuit.substring(1, 2)
    //
    //  Analysis of bqid
    //
    const level = bid
    switch (level) {
      // Pass
      case 'P':
        bid = 'Pass'
        suit = null
        break
      // Question
      case '?':
        bid = bidsuit
        suit = null
        break
      // Double
      case 'X':
        bid = bidsuit
        suit = null
        break
      //  Nothing
      case ' ':
      case 'n':
      case 'N':
        bid = null
        suit = null
        break
      default:
        //  No Trump
        if (suit === 'N') {
          bid = bidsuit
          suit = null
        }
        break
    }
    //
    //  Load Arrays
    //
    bids.push(bid)
    suits.push(suit)
  }
  //...................................................................................
  //.  Render the form
  //...................................................................................
  return (
    <tr key={idx}>
      {bids.map((bid, idx) =>
        bid !== null ? <QuizBiddingTableLineCell key={idx} bid={bid} suit={suits[idx]} /> : null
      )}
    </tr>
  )
}
