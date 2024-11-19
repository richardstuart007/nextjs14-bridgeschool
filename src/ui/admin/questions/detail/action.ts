'use server'

import { z } from 'zod'
import { table_update } from '@/src/lib/tables/tableGeneric/table_update'
import { table_write } from '@/src/lib/tables/tableGeneric/table_write'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import validate from '@/src/ui/admin/questions/detail/validate'
import { getNextSeq } from '@/src/lib/tables/tableSpecific/questions'
// ----------------------------------------------------------------------
//  Update Setup
// ----------------------------------------------------------------------
//
//  Form Schema for validation
//
const FormSchemaSetup = z.object({
  qowner: z.string(),
  qgroup: z.string(),
  qdetail: z.string()
})
//
//  Errors and Messages
//
export type StateSetup = {
  errors?: {
    qowner?: string[]
    qgroup?: string[]
    qdetail?: string[]
  }
  message?: string | null
  databaseUpdated?: boolean
}

const Setup = FormSchemaSetup

export async function Maint_detail(prevState: StateSetup, formData: FormData): Promise<StateSetup> {
  //
  //  Validate form data
  //
  const validatedFields = Setup.safeParse({
    qowner: formData.get('qowner'),
    qgroup: formData.get('qgroup'),
    qdetail: formData.get('qdetail')
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
  const { qowner, qgroup, qdetail } = validatedFields.data
  //
  //  Convert hidden fields value to numeric
  //
  const qqid = formData.get('qqid') as string | null
  const qqidString = qqid || ''
  const qqidNumber = qqid ? Number(qqid) : 0

  const qseq = formData.get('qseq')
  const qseqNumber = qseq ? Number(qseq) : 0
  //
  // Validate fields
  //
  const Table = {
    qqid: qqidNumber,
    qowner: qowner,
    qgroup: qgroup,
    qseq: qseqNumber
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
    //  Update
    //
    if (qqidNumber !== 0) {
      //
      //  update parameters
      //
      const updateParams = {
        table: 'questions',
        columnValuePairs: [{ column: 'qdetail', value: qdetail }],
        whereColumnValuePairs: [{ column: 'qqid', value: qqidString }]
      }
      const data = await table_update(updateParams)
    }
    //
    //  Write
    //
    else {
      //
      //  Get next sequence if Add
      //
      let qseqString = ''
      if (qqidNumber === 0) {
        const nextSeq = await getNextSeq(qowner, qgroup)
        qseqString = String(nextSeq)
      }
      //
      //  Get group id - qgid
      //
      const fetchParams = {
        table: 'ownergroup',
        columnValuePairs: [
          { column: 'ogowner', value: qowner },
          { column: 'oggroup', value: qgroup }
        ]
      }
      const rows = await table_fetch(fetchParams)
      // console.log('rows:', rows)
      const row = rows[0]
      const qgidString = String(row.oggid)
      //
      //  Write Parameters
      //
      const writeParams = {
        table: 'questions',
        columnValuePairs: [
          { column: 'qowner', value: qowner },
          { column: 'qgroup', value: qgroup },
          { column: 'qseq', value: String(qseqString) },
          { column: 'qdetail', value: qdetail },
          { column: 'qgid', value: qgidString }
        ]
      }
      const data = await table_write(writeParams)
      // console.log('data:', data)
    }
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
