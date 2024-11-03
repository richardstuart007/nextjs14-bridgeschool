import { useEffect, useState } from 'react'
import RadioGroup from './radio-button'
import { table_Questions } from '@/src/lib/definitions'

// Define the RadioOption type
interface RadioOption {
  id: string
  label: string
  value: number
}

interface QuizChoiceProps {
  question: table_Questions
  setAnswer: React.Dispatch<React.SetStateAction<number[]>>
  setShowSubmit: (value: boolean) => void
}

export default function QuizChoice(props: QuizChoiceProps): JSX.Element {
  const { question, setAnswer, setShowSubmit } = props
  const [answers, setAnswers] = useState<RadioOption[]>([])
  const [selectedOption, setSelectedOption] = useState<number>(99)
  const [questionText, setQuestionText] = useState<string>('')
  //
  //  Recreate on change of question
  //
  useEffect(() => {
    loadChoices()
    // eslint-disable-next-line
  }, [question])
  //...................................................................................
  //  Load the Choices
  //...................................................................................
  function loadChoices(): void {
    setShowSubmit(false)
    //
    //  Determine questionText
    //
    const qdetail = question.qdetail
    const hyperLink = qdetail.substring(0, 8) === 'https://'
    const text = hyperLink ? 'Select your answer' : qdetail
    setQuestionText(text)
    //
    //  Answers array
    //
    const shuffledOptions = shuffleArray(question.qans)
    const newOptions = shuffledOptions.map((option, index) => ({
      id: index.toString(),
      label: option.toString(),
      value: question.qans.indexOf(option)
    }))
    setAnswers(newOptions)
    //
    //  Reset selected option
    //
    setSelectedOption(99)
  }
  //...................................................................................
  // Shuffle array function
  //...................................................................................
  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }
  //...................................................................................
  //. Answer Selected
  //...................................................................................
  function handleSelect(value: number): void {
    setSelectedOption(value)
    setAnswer((prevAnswers: number[]) => [...prevAnswers, value])
    setShowSubmit(true)
  }
  //...................................................................................
  //  Format Panel
  //...................................................................................
  return (
    <div className='rounded-md bg-gray-50 p-1 md:p-2'>
      <p className='text-lg font-semibold text-left'>Question</p>
      <p className='text-left italic font-bold text-yellow-500'>{questionText}</p>
      <RadioGroup options={answers} selectedOption={selectedOption} onChange={handleSelect} />
    </div>
  )
}
