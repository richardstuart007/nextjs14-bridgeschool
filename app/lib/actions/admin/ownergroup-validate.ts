import { table_Ownergroup } from '@/app/lib/definitions'
import { fetch_ownergroup1, fetch_ownergroupID } from '@/app/lib/data/tables/ownergroup'
import { checkKeyInTables } from '@/app/lib/data/data-utilities'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    ogowner?: string[]
    oggroup?: string[]
    ogtitle?: string[]
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

export default async function validateOwnergroup(record: table_Ownergroup): Promise<StateSetup> {
  const { oggid, ogowner, oggroup } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  // Get existing owner
  //
  let id_record = null
  let id_oowner = ''
  if (oggid !== 0) {
    id_record = await fetch_ownergroupID(oggid)
    id_oowner = id_record.ogowner
  }
  //
  // Get new owner (if exists)
  //
  const ogowner_record = await fetch_ownergroup1(ogowner, oggroup)
  //
  //  Check for Add duplicate
  //
  if (oggid === 0 && ogowner_record) {
    errors.ogowner = ['Ownergroup must be unique']
  }
  //
  //  Check for Update
  //
  if (ogowner_record) {
    if (oggid !== 0 && ogowner_record.oggid !== oggid) {
      errors.ogowner = ['Ownergroup must be unique']
    }
  }
  //
  // Check a list of tables if owner changes
  //
  if (oggid !== 0 && ogowner !== id_oowner) {
    const keyValue = id_oowner
    const tableColumnPairs: TableColumnPair[] = [
      { table: 'usersowner', column: 'uoowner' },
      { table: 'ownergroup', column: 'ogowner' },
      { table: 'library', column: 'lrowner' },
      { table: 'questions', column: 'qowner' },
      { table: 'usershistory', column: 'r_owner' }
    ]
    const exists = await checkKeyInTables(keyValue, tableColumnPairs)
    if (exists) errors.ogowner = [`Key:${id_oowner} exists in other tables`]
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
