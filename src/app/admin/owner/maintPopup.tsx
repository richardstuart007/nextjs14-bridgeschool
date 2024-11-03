'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/app/admin/owner/maint'
import { table_Owner } from '@/src/lib/definitions'

interface Props {
  ownerRecord: table_Owner | null
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ ownerRecord, isOpen, onClose }: Props) {
  //
  // Close the popup on success
  //
  const handleSuccess = () => {
    onClose()
  }
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <Form ownerRecord={ownerRecord} onSuccess={handleSuccess} shouldCloseOnUpdate={true} />
    </Popup>
  )
}
