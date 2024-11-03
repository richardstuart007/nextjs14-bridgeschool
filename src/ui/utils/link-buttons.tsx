'use client'

import {
  TrophyIcon,
  BookOpenIcon,
  VideoCameraIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline'
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
      <Button className='bg-white hover:bg-gray-200' onClick={() => window.open(link, '_blank')}>
        {type === 'youtube' ? (
          <VideoCameraIcon className='w-5 h-5 text-black bg-white' />
        ) : (
          <BookOpenIcon className='w-5 h-5 text-black bg-white' />
        )}
      </Button>
    </>
  )
}
//-------------------------------------------------------------------------------------
//  Book Quiz Button
//-------------------------------------------------------------------------------------
export function BookQuiz({ gid }: { gid: number }) {
  return (
    <Link href={`/dashboard/quiz/${gid}`} className='hover:bg-gray-200'>
      <TrophyIcon className='w-5' />
    </Link>
  )
}
//-------------------------------------------------------------------------------------
//  Quiz Review
//-------------------------------------------------------------------------------------
export function QuizReview({ hid }: { hid: number }) {
  return (
    <Link href={`/dashboard/quiz-review/${hid}`} className='hover:bg-gray-200'>
      <DocumentMagnifyingGlassIcon className='w-5' />
    </Link>
  )
}
