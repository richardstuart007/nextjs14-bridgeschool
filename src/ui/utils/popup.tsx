import { ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface PopupProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export default function Popup({ isOpen, onClose, children }: PopupProps) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50'>
      <div className='relative bg-white p-6 rounded-lg max-w-md w-full shadow-lg'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-2xl font-bold text-gray-500 hover:text-gray-800'
        >
          <XMarkIcon className='h-6 w-6' />
        </button>
        {children}
      </div>
    </div>
  )
}
