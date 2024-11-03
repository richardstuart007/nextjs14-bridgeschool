import { table_Library } from '@/src/lib/definitions'
import { fetchLibraryByRefGroupOwner } from '@/src/lib/data/tables/library'
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    lrdesc?: string[]
    lrwho?: string[]
    lrtype?: string[]
    lrowner?: string[]
    lrref?: string[]
    lrgroup?: string[]
  }
  message?: string | null
}

export default async function validateLibrary(record: table_Library): Promise<StateSetup> {
  const { lrlid, lrref, lrowner, lrgroup } = record
  let errors: StateSetup['errors'] = {}
  //
  // Get existing unique combo ref/group/owner
  //
  const row = await fetchLibraryByRefGroupOwner(lrref, lrgroup, lrowner)
  // console.log('row', row)
  //
  //  Check for Add duplicate
  //
  if (lrlid === 0 && row) {
    errors.lrref = ['Reference & group & owner must be unique']
  }
  //
  //  Check for Update
  //
  if (row) {
    if (lrlid !== 0 && row.lrlid !== lrlid) {
      errors.lrref = ['Reference & group & owner must be unique']
    }
  }
  //
  // Return error messages
  //
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: 'Form validation failed. Please fix the errors and try again.'
    }
  }
  //
  //  No errors
  //
  return {
    message: null
  }
}
