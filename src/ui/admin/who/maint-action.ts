'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/table_update'
import { table_write } from '@/src/lib/tables/table_write'
import validate from '@/src/ui/admin/who/maint-validate'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  wwho: z.string(),
  wtitle: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    wwho?: string[]
    wtitle?: string[]
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
    wwho: formData.get('wwho'),
    wtitle: formData.get('wtitle')
  })
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
  const { wwho, wtitle } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const wwid = Number(formData.get('wwid'))
  //
  // Validate fields
  //
  const Table = {
    wwid: wwid,
    wwho: wwho,
    wtitle: wtitle
  }
  const errorMessages = await validate(Table)
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
    //  Write/Update
    //
    const updateParams = {
      table: 'who',
      columnValuePairs: [{ column: 'wtitle', value: wtitle }],
      whereColumnValuePairs: [{ column: 'wwho', value: wwho }]
    }
    const writeParams = {
      table: 'who',
      columnValuePairs: [
        { column: 'wwho', value: wwho },
        { column: 'wtitle', value: wtitle }
      ]
    }
    const data = await (wwid === 0 ? table_write(writeParams) : table_update(updateParams))
    // console.log('data:', data)

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update.',
      errors: undefined,
      databaseUpdated: false
    }
  }
}