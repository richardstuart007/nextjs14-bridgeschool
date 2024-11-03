'use client'
import { structure_SessionsInfo } from '@/src/lib/definitions'
interface FormProps {
  sessionInfo: structure_SessionsInfo
}
export default function NavSession(props: FormProps): JSX.Element {
  //
  //  Deconstruct props
  //
  const sessionInfo = props.sessionInfo
  const { bsuid, bsid, bsname } = sessionInfo
  return (
    <>
      {/*  Desktop  */}
      <div className='hidden md:block mb-2 h-8 rounded-md bg-green-600 p-2 md:h-16'>
        <div className='flex flex-row justify-between text-white md:w-50'>
          <h1>{`Session: ${bsid}`}</h1>
          <h1>{`User: ${bsuid}`}</h1>
        </div>
        <div className='w-48 text-white md:w-50'>
          <h1>{bsname}</h1>
        </div>
      </div>
    </>
  )
}
