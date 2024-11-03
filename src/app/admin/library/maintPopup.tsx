'use client'
import Popup from '@/src/ui/utils/popup'
import Form from '@/src/app/admin/library/maint'
import { table_Library } from '@/src/lib/definitions'

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
