'use server'

import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/logging'
import { table_Owner } from '@/src/lib/tables/definitions'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Delete owner and related tables rows by ID
//---------------------------------------------------------------------
export async function deleteOwnerById(ooid: number): Promise<string> {
  const functionName = 'deleteOwnerById'
  noStore()
  //
  //  Counts
  //
  const deletedCounts = {
    owner: 0
  }

  try {
    const userDeleteResult = await sql`DELETE FROM owner WHERE ooid=${ooid}`
    deletedCounts.owner = userDeleteResult.rowCount ?? 0
    //
    // Prepare a summary message
    //
    const summaryMessage = `
      Deleted Records:
      owner: ${deletedCounts.owner}
    `
    console.log(summaryMessage)
    return summaryMessage
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Owner data
//---------------------------------------------------------------------
export async function fetchOwnerFiltered(query: string, currentPage: number) {
  const functionName = 'fetchOwnerFiltered'
  noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Owner(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM owner
     ${sqlWhere}
      ORDER BY oowner
      LIMIT ${MAINT_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_Owner>(sqlQuery)
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
//  Owner where clause
//---------------------------------------------------------------------
export async function buildWhere_Owner(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let oid = 0
  let title = ''
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
        case 'oid':
          if (!isNaN(Number(value))) {
            oid = parseInt(value, 10)
          }
          break
        case 'title':
          title = value
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
  if (oid !== 0) whereClause += `ooid = ${oid} AND `
  if (title !== '') whereClause += `otitle ILIKE '%${title}%' AND `
  if (owner !== '') whereClause += `oowner ILIKE '%${owner}%' AND `
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
//  Owner totals
//---------------------------------------------------------------------
export async function fetchOwnerTotalPages(query: string) {
  const functionName = 'fetchOwnerTotalPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Owner(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM owner
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
//  Write Owner
//---------------------------------------------------------------------
export async function writeOwner(oowner: string, otitle: string) {
  const functionName = 'writeOwner'
  try {
    const { rows } = await sql`
    INSERT INTO owner (
      oowner,
      otitle
    ) VALUES (
      ${oowner},
      ${otitle}
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
//  Update Owner
//---------------------------------------------------------------------
export async function updateOwner(ooid: number, oowner: string, otitle: string) {
  const functionName = 'updateOwner'
  try {
    const { rows } = await sql`
    UPDATE owner
    SET
      oowner = ${oowner},
      otitle = ${otitle}
    WHERE ooid = ${ooid}
    RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
