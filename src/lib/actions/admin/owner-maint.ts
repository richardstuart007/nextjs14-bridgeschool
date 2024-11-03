'use server'

import { z } from 'zod'
import { updateOwner, writeOwner } from '@/src/lib/data/tables/owner'
import validateOwner from '@/src/lib/actions/admin/owner-validate'
// ----------------------------------------------------------------------
//  Update Owner Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  oowner: z.string(),
  otitle: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    oowner?: string[]
    otitle?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function OwnerMaint(prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    oowner: formData.get('oowner'),
    otitle: formData.get('otitle')
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
  const { oowner, otitle } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const ooid = Number(formData.get('ooid'))
  // console.log('ooid:', ooid)
  //
  // Validate fields
  //
  const OwnerTable = {
    ooid: ooid,
    oowner: oowner,
    otitle: otitle
  }
  const errorMessages = await validateOwner(OwnerTable)
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
    await (ooid === 0 ? writeOwner(oowner, otitle) : updateOwner(ooid, oowner, otitle))

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
