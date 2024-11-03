'use client'
import Popup from '@/app/ui/utils/popup'
import Form from '@/app/admin/library/maint'
import { table_Library } from '@/app/lib/definitions'

interface Props {
  libraryRecord: table_Library | null
  isOpen: boolean
  onClose: () => void
}

export default function MaintPopup({ libraryRecord, isOpen, onClose }: Props) {
  //
  // Close the popup on success
  //
  const handleSuccess = () => {
    onClose()
  }
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <Form libraryRecord={libraryRecord} onSuccess={handleSuccess} shouldCloseOnUpdate={true} />
    </Popup>
  )
}
