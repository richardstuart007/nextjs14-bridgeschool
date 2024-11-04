'use client'

import { Button } from '@/src/ui/utils/button'

interface QuizSubmitProps {
  onNextQuestion: () => void
}

export function QuizSubmit({ onNextQuestion }: QuizSubmitProps) {
  return (
    <>
      <Button
        className='px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
        onClick={onNextQuestion}
      >
        Submit Selection
      </Button>
    </>
  )
}
