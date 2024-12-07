'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import bcrypt from 'bcryptjs'
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
    //
    //  Update the userspwd data
    //
    const upuid = userid
    const uphash = await bcrypt.hash(uppwd, 10)
    const updateParams = {
      table: 'userspwd',
      columnValuePairs: [{ column: 'uphash', value: uphash }],
      whereColumnValuePairs: [{ column: 'upuid', value: upuid }]
    }
    await table_update(updateParams)
    return {
      message: 'Password updated successfully.',
      errors: undefined
    }
    //
    //  Errors
    //
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Password.',
      errors: undefined
    }
  }
}
