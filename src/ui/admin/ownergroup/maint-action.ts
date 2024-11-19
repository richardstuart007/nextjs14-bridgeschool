'use server'

import { z } from 'zod'
import { updateOwnergroup, writeOwnergroup } from '@/src/lib/tables/tableSpecific/ownergroup'
import validateOwnergroup from '@/src/ui/admin/ownergroup/maint-validate'
// ----------------------------------------------------------------------
//  Update Owner Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  ogowner: z.string(),
  oggroup: z.string(),
  ogtitle: z.string()
})
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
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint(prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    ogowner: formData.get('ogowner'),
    oggroup: formData.get('oggroup'),
    ogtitle: formData.get('ogtitle')
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
  const { ogowner, oggroup, ogtitle } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const oggid = Number(formData.get('oggid'))
  //
  // Validate fields
  //
  const table_Ownergroup = {
    oggid: oggid,
    ogowner: ogowner,
    oggroup: oggroup,
    ogcntquestions: 0,
    ogcntlibrary: 0,
    ogtitle: ogtitle
  }
  const errorMessages = await validateOwnergroup(table_Ownergroup)
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
    //  Write/Update the owner
    //
    await (oggid === 0
      ? writeOwnergroup(ogowner, oggroup, ogtitle)
      : updateOwnergroup(oggid, ogowner, oggroup, ogtitle))

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Owner.',
      errors: undefined,
      databaseUpdated: false
    }
  }
}
