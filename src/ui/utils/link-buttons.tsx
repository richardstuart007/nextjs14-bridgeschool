'use client'

import Link from 'next/link'
import { Button } from '@/src/ui/utils/button'
//-------------------------------------------------------------------------------------
//  BookView Button
//-------------------------------------------------------------------------------------
interface BookViewProps {
  type: string
  link: string
}
export function BookView({ type, link }: BookViewProps) {
  return (
    <>
      <Button
        className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
        onClick={() => window.open(link, '_blank')}
      >
        {type === 'youtube' ? 'Video' : 'Book'}
      </Button>
    </>
  )
}
//-------------------------------------------------------------------------------------
//  Quiz Review
//-------------------------------------------------------------------------------------
export function QuizReview({ hid }: { hid: number }) {
  return (
    <Link
      href={`/dashboard/quiz-review/${hid}`}
      className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
    >
      Review
    </Link>
  )
}
//-------------------------------------------------------------------------------------
//  Book Quiz Button
//-------------------------------------------------------------------------------------
export function BookQuiz({ gid }: { gid: number }) {
  return (
    <Link
      href={`/dashboard/quiz/${gid}`}
      className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'
    >
      Quiz
    </Link>
  )
}
