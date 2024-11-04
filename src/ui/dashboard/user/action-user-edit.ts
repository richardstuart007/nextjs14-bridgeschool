'use server'

import { z } from 'zod'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// ----------------------------------------------------------------------
//  Update User Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  u_uid: z.string(),
  u_name: z.string(),
  u_fedid: z.string(),
  u_fedcountry: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    u_uid?: string[]
    u_name?: string[]
    u_fedid?: string[]
    u_fedcountry?: string[]
  }
  message?: string | null
}

const Setup = FormSchemaSetup

export async function UserEdit(prevState: StateSetup, formData: FormData) {
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    u_uid: formData.get('u_uid'),
    u_name: formData.get('u_name'),
    u_fedid: formData.get('u_fedid'),
    u_fedcountry: formData.get('u_fedcountry')
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
  const { u_uid, u_name, u_fedid, u_fedcountry } = validatedFields.data
  //
  // Update data into the database
  //
  try {
    await sql`
    UPDATE users
    SET
      u_name = ${u_name},
      u_fedid = ${u_fedid},
      u_fedcountry = ${u_fedcountry}
    WHERE u_uid = ${u_uid}
    `

    return {
      message: 'User updated successfully.',
      errors: undefined
    }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update User.'
    }
  }
  //
  // Revalidate the cache and redirect the user.
  //
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
