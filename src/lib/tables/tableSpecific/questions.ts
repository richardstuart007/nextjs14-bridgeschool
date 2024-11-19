'use server'

import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_Questions } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Questions data by ID
//---------------------------------------------------------------------
export async function fetchQuestionsByGid(qgid: number) {
  const functionName = 'fetchQuestionsByGid'
  noStore()
  try {
    const data = await sql<table_Questions>`
      SELECT *
      FROM questions
      WHERE qgid = ${qgid}
      ORDER BY qgid, qseq;
    `
    //
    //  Return rows
    //
    const rows = data.rows
    return rows
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  questions data
//---------------------------------------------------------------------
export async function fetchQuestionsFiltered(query: string, currentPage: number) {
  const functionName = 'fetchQuestionsFiltered'
  noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_questions(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM questions
     ${sqlWhere}
      ORDER BY qowner, qgroup, qseq
      LIMIT ${MAINT_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_Questions>(sqlQuery)
    client.release()
    //
    //  Return results
    //
    const rows = data.rows
    return rows
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  questions where clause
//---------------------------------------------------------------------
export async function buildWhere_questions(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let qid = 0
  let group = ''
  let owner = ''
  //
  // Split the search query into parts based on spaces
  //
  const parts = query.split(/\s+/).filter(part => part.trim() !== '')
  //
  // Loop through each part to extract values using switch statement
  //
  parts.forEach(part => {
    if (part.includes(':')) {
      const [key, value] = part.split(':')
      //
      //  Check for empty values
      //
      if (value === '') return
      //
      // Process each part
      //
      switch (key) {
        case 'qid':
          if (!isNaN(Number(value))) {
            qid = parseInt(value, 10)
          }
          break
        case 'group':
          group = value
          break
        case 'owner':
          owner = value
          break
        default:
          owner = value
          break
      }
    } else {
      // Default to 'owner' if no key is provided
      if (owner === '') {
        owner = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (qid !== 0) whereClause += `qqid = ${qid} AND `
  if (group !== '') whereClause += `qgroup ILIKE '%${group}%' AND `
  if (owner !== '') whereClause += `qowner ILIKE '%${owner}%' AND `
  //
  // Remove the trailing 'AND' if there are conditions
  //
  let whereClauseUpdate = ``
  if (whereClause !== '') {
    whereClauseUpdate = `WHERE ${whereClause.slice(0, -5)}`
  }
  return whereClauseUpdate
}
//---------------------------------------------------------------------
//  questions totals
//---------------------------------------------------------------------
export async function fetchQuestionsTotalPages(query: string) {
  const functionName = 'fetchQuestionsTotalPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_questions(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM questions
    ${sqlWhere}`
    //
    //  Run SQL
    //
    const client = await db.connect()
    const result = await client.query(sqlQuery)
    client.release()
    //
    //  Return results
    //
    const count = result.rows[0].count
    const totalPages = Math.ceil(count / MAINT_ITEMS_PER_PAGE)
    return totalPages
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Write questions
//---------------------------------------------------------------------
export async function writeowner(qowner: string, qgroup: string) {
  const functionName = 'writeowner'
  try {
    const { rows } = await sql`
    INSERT INTO questions (
      qowner,
      qgroup
    ) VALUES (
      ${qowner},
      ${qgroup}
    )
    RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Update questions
//---------------------------------------------------------------------
export async function updatequestions(qqid: number, qowner: string, qgroup: string) {
  const functionName = 'updatequestions'
  try {
    const { rows } = await sql`
    UPDATE questions
    SET
      qowner = ${qowner},
      qgroup = ${qgroup}
    WHERE qqid = ${qqid}
    RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Get next qseq
//---------------------------------------------------------------------
export async function getNextSeq(qowner: string, qgroup: string) {
  const functionName = 'getNextSeq'
  try {
    const { rows } = await sql`
    SELECT COALESCE(MAX(qseq) + 1, 1) AS next_qseq
    FROM questions
    WHERE qowner = ${qowner}
      AND qgroup = ${qgroup}
  ;
  `
    console.log(rows)
    const next_qseq = rows[0].next_qseq
    return next_qseq
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
