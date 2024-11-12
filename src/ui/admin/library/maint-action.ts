'use server'

import { z } from 'zod'
import { updateLibrary, writeLibrary } from '@/src/lib/tables/library'
import { fetch_ownergroup1 } from '@/src/lib/tables/ownergroup'
import validateLibrary from '@/src/ui/admin/library/maint-validate'
// ----------------------------------------------------------------------
//  Update Library Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  lrowner: z.string(),
  lrgroup: z.string(),
  lrref: z.string().min(1),
  lrdesc: z.string().min(1),
  lrwho: z.string(),
  lrtype: z.string(),
  lrlink: z.string().min(1)
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    lrowner?: string[]
    lrgroup?: string[]
    lrref?: string[]
    lrdesc?: string[]
    lrwho?: string[]
    lrtype?: string[]
    lrlink?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function LibraryMaint(prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    lrowner: formData.get('lrowner'),
    lrgroup: formData.get('lrgroup'),
    lrref: formData.get('lrref'),
    lrdesc: formData.get('lrdesc'),
    lrwho: formData.get('lrwho'),
    lrtype: formData.get('lrtype'),
    lrlink: formData.get('lrlink')
  })
  // console.log('formData', formData)
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid or missing fields'
    }
  }
  //
  // Unpack form data
  //
  // console.log('Database update')
  const { lrdesc, lrlink, lrwho, lrtype, lrowner, lrref, lrgroup } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const lrlid = Number(formData.get('lrlid'))
  // console.log('lrlid:', lrlid)
  //
  // Validate fields
  //
  const table_Library = {
    lrlid: lrlid,
    lrref: lrref,
    lrdesc: lrdesc,
    lrlink: lrlink,
    lrwho: lrwho,
    lrtype: lrtype,
    lrowner: lrowner,
    lrgroup: lrgroup,
    lrgid: 0
  }
  const errorMessages = await validateLibrary(table_Library)
  if (errorMessages.message) {
    return {
      errors: errorMessages.errors,
      message: errorMessages.message,
      databaseUpdated: false
    }
  }
  //
  // Update data into the database
  //
  try {
    //
    //  Get the ownergroup id
    //
    const ownergroup = await fetch_ownergroup1(lrowner, lrgroup)
    const lrgid = ownergroup.oggid
    //
    //  Write/Update the library
    //
    await (lrlid === 0
      ? writeLibrary(lrdesc, lrlink, lrwho, lrtype, lrowner, lrref, lrgroup, lrgid)
      : updateLibrary(lrlid, lrdesc, lrlink, lrwho, lrtype, lrowner, lrref, lrgroup, lrgid))

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Library.',
      errors: undefined,
      databaseUpdated: false
    }
  }
}
