import React, { useEffect, useState } from 'react'
import RadioGroup from './radio-review-button'
import { table_Questions } from '@/app/lib/definitions'

interface RadioOption {
  id: string
  label: string
  value: number
}

interface QuizReviewChoiceProps {
  question: table_Questions
  correctAnswer: number
  selectedAnswer: number
}

export default function QuizReviewChoice(props: QuizReviewChoiceProps): JSX.Element {
  const { question, correctAnswer, selectedAnswer } = props
  const [answers, setAnswers] = useState<RadioOption[]>([])
  const [questionText, setQuestionText] = useState<string>('')

  useEffect(() => {
    loadChoices()
    // eslint-disable-next-line
  }, [question])
  //...................................................................................
  //  Load the Choices
  //...................................................................................
  function loadChoices(): void {
    const qdetail = question.qdetail
    const hyperLink = qdetail.substring(0, 8) === 'https://'
    const text = hyperLink ? 'Select your answer' : qdetail
    setQuestionText(text)
    //
    //  Answers
    //
    const newOptions = question.qans.map((option, index) => ({
      id: index.toString(),
      label: option.toString(),
      value: question.qans.indexOf(option)
    }))
    setAnswers(newOptions)
  }

  return (
    <div className='rounded-md bg-gray-50 p-1 md:p-2'>
      <p className='text-lg font-semibold text-left'>Question</p>
      <p className='text-left italic font-bold text-yellow-500'>{questionText}</p>
      <RadioGroup options={answers} selectedOption={selectedAnswer} correctOption={correctAnswer} />
      <p className='text-sm text-left font-bold'></p>
    </div>
  )
}
