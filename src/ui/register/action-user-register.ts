'use server'

import { z } from 'zod'
import { writeUser, writeUsersPwd } from '@/src/lib/tables/tableSpecific/users'
import type { table_Users } from '@/src/lib/tables/definitions'
import { signIn } from '@/auth'
import { table_check } from '@/src/lib/tables/tableGeneric/table_check'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
// ----------------------------------------------------------------------
//  Register
// ----------------------------------------------------------------------
const FormSchemaRegister = z.object({
  name: z.string(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(1)
})

export type StateRegister = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string | null
}

const Register = FormSchemaRegister

export async function registerUser(prevState: StateRegister | undefined, formData: FormData) {
  //
  //  Validate the fields using Zod
  //
  const validatedFields = Register.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  })
  //
  // If form validation fails, return errors early. Otherwise, continue.
  //
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Register.'
    }
  }
  //
  // Unpack form data
  //
  const { name, email, password } = validatedFields.data
  //
  // Check if email exists already
  //
  const tableColumnValuePairs = [
    {
      table: 'users',
      whereColumnValuePairs: [{ column: 'u_email', value: email }]
    }
  ]
  const exists = await table_check(tableColumnValuePairs)
  if (exists) {
    return {
      message: 'Email already exists'
    }
  }
  //
  // Insert data into the database
  //
  const provider = 'email'
  //
  //  Write User
  //
  const userRecord = (await writeUser(provider, email, name)) as table_Users | undefined
  if (!userRecord) {
    throw Error('registerUser: Write User Error')
  }
  //
  //  Write the userspwd data
  //
  const userid = userRecord.u_uid
  await writeUsersPwd(userid, password, email)
  //
  //  Write the usersowner data
  //
  const dataUserowner = await table_write({
    table: 'usersowner',
    columnValuePairs: [
      { column: 'uouid', value: userid },
      { column: 'uoowner', value: 'Richard' }
    ]
  })
  //
  //  SignIn
  //
  await signIn('credentials', { email, password, redirectTo: '/dashboard' })
}
