'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/table_update'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  qans: z.array(z.string()),
  qpoints: z.array(z.string())
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qans?: string[]
    qpoints?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint(prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  //
  // Populate qans and qpoints arrays
  //
  const qans: string[] = []
  const qpoints: string[] = []
  for (let i = 0; formData.has(`qans${i}`) || formData.has(`qpoints${i}`); i++) {
    qans.push((formData.get(`qans${i}`) as string) || '')
    qpoints.push((formData.get(`qpoints${i}`) as string) || '0')
  }
  const validatedFields = Setup.safeParse({ qans, qpoints })
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
  // Initialize an errors object to accumulate any validation errors
  //
  let errors: StateSetup['errors'] = {}
  //
  // Ensure no `qans` entry exists if the previous entry is empty
  //
  for (let i = 1; i < qans.length; i++) {
    if (qans[i] && !qans[i - 1]) {
      errors.qans = errors.qans || []
      errors.qans.push(`Answer at index ${i} requires the previous answer to be filled.`)
    }
  }
  //
  // Ensure there are at least two valid `qans` entries
  //
  const validAnswersCount = qans.filter(answer => answer.trim()).length
  if (validAnswersCount < 2) {
    errors.qans = errors.qans || []
    errors.qans.push('At least two answers are required.')
  }
  //
  // Return validation errors if any exist
  //
  if (Object.keys(errors).length > 0) {
    return {
      errors,
      message: 'Validation failed.'
    }
  }
  // return {
  //   errors,
  //   message: 'Validation OK.'
  // }
  //
  //  Convert hidden fields value to numeric
  //
  const qqid = formData.get('qqid') as string | null
  const qqidString = qqid || ''
  //
  // Update data into the database
  //
  try {
    //
    // Create pairs of qans and qpoints where qans is non-empty
    //
    const validPairs = qans
      .map((qansValue, index) => ({ qansValue, qpointsValue: qpoints[index] }))
      .filter(pair => pair.qansValue !== '')
    //
    // Extract the valid qans and qpoints values
    //
    const validQans = validPairs.map(pair => pair.qansValue)
    const validQpoints = validPairs.map(pair => {
      const strippedValue = pair.qpointsValue.replace(/^0+/, '')
      return strippedValue === '' ? '0' : strippedValue
    })
    //
    // Create the value pairs
    //
    const qansValue = `{${validQans.join(',')}}`
    const qpointsValue = `{${validQpoints.join(',')}}`
    //
    //  Update database
    //
    const updateParams = {
      table: 'questions',
      columnValuePairs: [
        { column: 'qans', value: qansValue },
        { column: 'qpoints', value: qpointsValue }
      ],
      whereColumnValuePairs: [{ column: 'qqid', value: qqidString }]
    }
    const data = await table_update(updateParams)

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