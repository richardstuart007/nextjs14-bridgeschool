import { ownerTable } from '@/app/lib/definitions'
import { fetchOwnerByOwner, fetchOwnerByID } from '@/app/lib/data/tables/owner'
import { checkKeyInTables } from '@/app/lib/data/data-utilities'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    otitle?: string[]
    oowner?: string[]
  }
  message?: string | null
}
//
// Define a type for the table-column pair
//
interface TableColumnPair {
  table: string
  column: string
}

export default async function validateOwner(record: ownerTable): Promise<StateSetup> {
  const { ooid, oowner } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  // Get existing owner
  //
  let id_record = null
  let id_oowner = ''
  if (ooid !== 0) {
    id_record = await fetchOwnerByID(ooid)
    id_oowner = id_record.oowner
  }
  //
  // Get new owner (if exists)
  //
  const oowner_record = await fetchOwnerByOwner(oowner)
  //
  //  Check for Add duplicate
  //
  if (ooid === 0 && oowner_record) {
    errors.oowner = ['Owner must be unique']
  }
  //
  //  Check for Update
  //
  if (oowner_record) {
    if (ooid !== 0 && oowner_record.ooid !== ooid) {
      errors.oowner = ['Owner must be unique']
    }
  }
  //
  // Check a list of tables if owner changes
  //
  if (ooid !== 0 && oowner !== id_oowner) {
    const keyValue = id_oowner
    const tableColumnPairs: TableColumnPair[] = [
      { table: 'usersowner', column: 'uoowner' },
      { table: 'ownergroup', column: 'ogowner' },
      { table: 'library', column: 'lrowner' },
      { table: 'questions', column: 'qowner' },
      { table: 'usershistory', column: 'r_owner' }
    ]
    const exists = await checkKeyInTables(keyValue, tableColumnPairs)
    if (exists) errors.oowner = [`Key:${id_oowner} exists in other tables`]
  }
  //
  // Return error messages
  //
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: 'Form validation failed.'
    }
  }
  //
  //  No errors
  //
  return {
    message: null
  }
}
