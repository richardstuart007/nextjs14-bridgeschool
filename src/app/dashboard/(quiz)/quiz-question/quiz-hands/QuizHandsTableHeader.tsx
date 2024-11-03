import Image from 'next/image'
export default function QuizHandsTableHeader() {
  return (
    <thead className='rounded-lg text-left text-sm font-normal'>
      <tr>
        <th scope='col' className='px-4  font-medium'></th>
        <th scope='col' className='px-4  font-medium'>
          <Image src='/suits/spade.svg' width={15} height={15} alt='spade' />
        </th>
        <th scope='col' className='px-4  font-medium'>
          <Image src='/suits/heart.svg' width={15} height={15} alt='heart' />
        </th>
        <th scope='col' className='px-4  font-medium'>
          <Image src='/suits/diamond.svg' width={15} height={15} alt='diamond' />
        </th>
        <th scope='col' className='px-4  font-medium'>
          <Image src='/suits/club.svg' width={15} height={15} alt='club' />
        </th>
      </tr>
    </thead>
  )
}
