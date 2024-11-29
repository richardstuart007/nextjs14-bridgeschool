'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import validate from '@/src/ui/admin/reftype/maint-validate'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  rttype: z.string(),
  rttitle: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    rttype?: string[]
    rttitle?: string[]
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
    rttype: formData.get('rttype'),
    rttitle: formData.get('rttitle')
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
  const { rttype, rttitle } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const rtrid = Number(formData.get('rtrid'))
  //
  // Validate fields
  //
  const Table = {
    rtrid: rtrid,
    rttype: rttype,
    rttitle: rttitle
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
      table: 'reftype',
      columnValuePairs: [{ column: 'rttitle', value: rttitle }],
      whereColumnValuePairs: [{ column: 'rttype', value: rttype }]
    }
    const writeParams = {
      table: 'reftype',
      columnValuePairs: [
        { column: 'rttype', value: rttype },
        { column: 'rttitle', value: rttitle }
      ]
    }
    const data = await (rtrid === 0 ? table_write(writeParams) : table_update(updateParams))

    return {
      message: `Database updated successfully.`,
      errors: undefined,
      databaseUpdated: true
    }
    //
    //  Errors
    //
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update.',
      errors: undefined,
      databaseUpdated: false
    }
  }
}
