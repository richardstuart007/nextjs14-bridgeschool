'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/app/admin/users/useredit/userEdit'
import { table_Users } from '@/src/lib/definitions'

interface Props {
  userRecord: table_Users | null
  isOpen: boolean
  onClose: () => void
}

export default function EditPopup({ userRecord, isOpen, onClose }: Props) {
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      {userRecord && <Form UserRecord={userRecord} />}
    </Popup>
  )
}
