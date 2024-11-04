'use client'

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

interface QuizReviewNextProps {
  onNextQuestion: () => void
}

interface QuizReviewPreviousProps {
  onPreviousQuestion: () => void
}

export function QuizReviewNext({ onNextQuestion }: QuizReviewNextProps) {
  return (
    <div
      className='flex h-10 w-10 mr-2 md:mr-4 items-center justify-center rounded-md border text-gray-500 bg-white hover:bg-gray-100 outline-none'
      onClick={onNextQuestion}
    >
      <ArrowRightIcon className='h-6 w-6' aria-hidden='true' />
    </div>
  )
}

export function QuizReviewPrevious({ onPreviousQuestion }: QuizReviewPreviousProps) {
  return (
    <div
      className='flex h-10 w-10 mr-2 md:mr-4 items-center justify-center rounded-md border text-gray-500 bg-white hover:bg-gray-100 outline-none'
      onClick={onPreviousQuestion}
    >
      <ArrowLeftIcon className='h-6 w-6' aria-hidden='true' />
    </div>
  )
}
