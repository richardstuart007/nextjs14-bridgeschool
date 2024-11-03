'use server'

import { z } from 'zod'
import { updateUsersPwd } from '@/src/lib/data/tables/users'
// ----------------------------------------------------------------------
//  Update User Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  upuid: z.string(),
  uppwd: z.string().min(1, { message: 'String must be at least 2 characters long' })
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    upuid?: string[]
    uppwd?: string[]
  }
  message?: string | null
}

const Setup = FormSchemaSetup

export async function PwdEdit(prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    upuid: formData.get('upuid'),
    uppwd: formData.get('uppwd')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update User.'
    }
  }
  //
  // Unpack form data
  //
  const { upuid, uppwd } = validatedFields.data
  const userid = parseInt(upuid, 10)
  //
  // Update data into the database
  //
  try {
    await updateUsersPwd(userid, uppwd)

    return {
      message: 'Password updated successfully.',
      errors: undefined
    }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Password.',
      errors: undefined
    }
  }
}
