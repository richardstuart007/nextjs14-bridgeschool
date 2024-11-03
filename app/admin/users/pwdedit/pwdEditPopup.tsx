'use client'
import Popup from '@/app/ui/utils/popup'
import Form from '@/app/admin/users/pwdedit/pwdEdit'
import { table_Users } from '@/app/lib/definitions'

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
