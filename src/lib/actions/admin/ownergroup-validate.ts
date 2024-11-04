import { table_Ownergroup } from '@/src/lib/definitions'
import { checkKeysInTables } from '@/src/lib/data/checkKeysInTables'
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

export default async function validateOwnergroup(record: table_Ownergroup): Promise<StateSetup> {
  const { oggid, ogowner, oggroup } = record
  //
  // Initialise errors return
  //
  let errors: StateSetup['errors'] = {}
  //
  //  Check for Add duplicate
  //
  if (oggid === 0) {
    const tableColumnValuePairs = [
      {
        table: 'ownergroup',
        columnValuePairs: [
          { column: 'ogowner', value: ogowner },
          { column: 'oggroup', value: oggroup }
        ]
      }
    ]
    const exists = await checkKeysInTables(tableColumnValuePairs)
    if (exists) errors.oggroup = ['Owner/Group must be unique']
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
