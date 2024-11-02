'use client'
import Popup from '@/app/ui/utils/popup'
import Form from '@/app/admin/owner/ownerMaint'
import { ownerTable } from '@/app/lib/definitions'

interface Props {
  ownerRecord: ownerTable | null
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
