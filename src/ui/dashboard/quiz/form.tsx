'use client'
import { useState, useEffect } from 'react'
import { table_Questions } from '@/src/lib/tables/definitions'
import QuizQuestion from '@/src/ui/dashboard/quiz-question/quiz-question'
import QuizBidding from '@/src/ui/dashboard/quiz-question/quiz-bidding/QuizBidding'
import QuizHands from '@/src/ui/dashboard/quiz-question/quiz-hands/QuizHands'
import QuizChoice from './quiz-choice'
import { QuizSubmit } from '@/src/ui/dashboard/quiz/buttons'
import { useRouter } from 'next/navigation'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { fetchSessionInfo } from '@/src/lib/tables/tableSpecific/sessions'
import { useUserContext } from '@/UserContext'

interface QuestionsFormProps {
  questions: table_Questions[]
}
//...................................................................................
//.  Main Line
//...................................................................................
export default function QuestionsForm(props: QuestionsFormProps): JSX.Element {
  //
  //  Router
  //
  const router = useRouter()
  //
  //  User context
  //
  const { sessionContext } = useUserContext()
  const cxid = sessionContext.cxid
  const cxuid = sessionContext.cxuid
  //
  //  Questions state updated in initial load
  //
  const [questions, setQuestions] = useState<table_Questions[]>([])
  //
  //  Fetch session data when the component mounts
  //
  useEffect(() => {
    initializeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  //
  //  State variables
  //
  const [index, setIndex] = useState(0)
  const [question, setQuestion] = useState(questions[index])
  const [answer, setAnswer] = useState<number[]>([])
  const [showSubmit, setShowSubmit] = useState(false)
  //
  //  Array length
  //
  const quizTotal = questions.length
  //-------------------------------------------------------------------------
  //  Get Data
  //-------------------------------------------------------------------------
  async function initializeData() {
    try {
      const data = await fetchSessionInfo(cxid)
      if (!data) throw Error('No data')
      //
      //  Update variables
      //
      const { bsdftmaxquestions, bssortquestions } = data
      //
      //  Deconstruct props
      //
      let questions_work = [...props.questions]
      //
      //  Optionally shuffle array
      //
      if (bssortquestions) questions_work = shuffleAndRestrict(questions_work)
      //
      //  Restrict array size
      //
      questions_work = questions_work.slice(0, bsdftmaxquestions)
      //
      //  Update questions and initial question
      //
      setQuestions(questions_work)
      setQuestion(questions_work[0])
      //
      //  Errors
      //
    } catch (error) {
      console.error('An error occurred while fetching data:', error)
    }
  }
  //...................................................................................
  //.  Shuffle the array using Fisher-Yates algorithm
  //...................................................................................
  function shuffleAndRestrict<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
  //...................................................................................
  //.  Next Question
  //...................................................................................
  function handleNextQuestion() {
    const nextQuestionIndex = index + 1
    if (nextQuestionIndex < questions.length) {
      setIndex(nextQuestionIndex)
      setQuestion(questions[nextQuestionIndex])
      return
    }
    //
    //  Quiz completed
    //
    handleQuizCompleted()
  }
  //...................................................................................
  //.  Quiz Completed
  //...................................................................................
  async function handleQuizCompleted() {
    //
    //  Initialise the results
    //
    let r_qid: number[] = []
    let r_points: number[] = []
    let r_totalpoints = 0
    let r_maxpoints = 0
    let r_correctpercent = 0
    //
    // Get the answered questions
    //
    const answeredQuestions = questions.slice(0, answer.length)
    //
    //  Loop through the answered questions to populate the points
    //
    answeredQuestions.forEach((question, i) => {
      r_qid.push(question.qqid)

      const p = answer[i]
      const points = question.qpoints[p]
      if (points !== undefined) {
        r_points.push(points)
        r_totalpoints += points
      }
      //
      //  Max points
      //
      r_maxpoints += Math.max(...question.qpoints)
    })
    //
    //  Calculate the correct percentage
    //
    if (r_maxpoints !== 0) {
      r_correctpercent = Math.ceil((r_totalpoints * 100) / r_maxpoints)
    }
    //
    // Create a NewUsersHistoryTable object
    //
    const r_datetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
    //
    //  Create parameters
    //
    const writeParams = {
      table: 'usershistory',
      columnValuePairs: [
        { column: 'r_datetime', value: r_datetime },
        { column: 'r_owner', value: question.qowner },
        { column: 'r_group', value: question.qgroup },
        { column: 'r_questions', value: answer.length },
        { column: 'r_qid', value: r_qid },
        { column: 'r_ans', value: answer },
        { column: 'r_uid', value: cxuid },
        { column: 'r_points', value: r_points },
        { column: 'r_maxpoints', value: r_maxpoints },
        { column: 'r_correctpercent', value: r_correctpercent },
        { column: 'r_gid', value: question.qgid },
        { column: 'r_sid', value: cxid }
      ]
    }
    //
    //  Write the history record
    //
    const historyRecords = await table_write(writeParams)
    const historyRecord = historyRecords[0]
    //
    //  Go to the quiz review page
    //
    const { r_hid } = historyRecord
    router.push(`/dashboard/quiz-review/${r_hid}`)
  }
  //...................................................................................
  //.  Render the form
  //...................................................................................
  if (!question) return <div>Loading...</div>
  return (
    <>
      <QuizQuestion question={question} quizQuestion={index + 1} quizTotal={quizTotal} />
      <QuizBidding question={question} />
      <QuizHands question={question} />
      <QuizChoice question={question} setAnswer={setAnswer} setShowSubmit={setShowSubmit} />
      {showSubmit ? (
        <div className='whitespace-nowrap px-3 h-5'>
          <QuizSubmit onNextQuestion={handleNextQuestion} />
        </div>
      ) : null}
    </>
  )
}
