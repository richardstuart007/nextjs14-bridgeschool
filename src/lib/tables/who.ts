'use server'

import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_Who } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/logging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Fetch who table
//---------------------------------------------------------------------
export async function fetch_who() {
  const functionName = 'fetch_who'
  // noStore()
  try {
    const data = await sql<table_Who>`
      SELECT *
      FROM who
      ;
    `
    const rows = data.rows
    return rows
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Delete who and related tables rows by ID
//---------------------------------------------------------------------
export async function deleteWhoById(wwid: number): Promise<string> {
  const functionName = 'deleteWhoById'
  noStore()
  //
  //  Counts
  //
  const deletedCounts = {
    who: 0
  }

  try {
    const userDeleteResult = await sql`DELETE FROM who WHERE wwid=${wwid}`
    deletedCounts.who = userDeleteResult.rowCount ?? 0
    //
    // Prepare a summary message
    //
    const summaryMessage = `
      Deleted Records:
      who: ${deletedCounts.who}
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
//  Who data
//---------------------------------------------------------------------
export async function fetchWhoFiltered(query: string, currentPage: number) {
  const functionName = 'fetchWhoFiltered'
  // noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Who(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM who
     ${sqlWhere}
      ORDER BY wwho
      LIMIT ${MAINT_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_Who>(sqlQuery)
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
//  Who where clause
//---------------------------------------------------------------------
export async function buildWhere_Who(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let wid = 0
  let title = ''
  let who = ''
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
        case 'wid':
          if (!isNaN(Number(value))) {
            wid = parseInt(value, 10)
          }
          break
        case 'title':
          title = value
          break
        case 'who':
          who = value
          break
        default:
          who = value
          break
      }
    } else {
      // Default to 'who' if no key is provided
      if (who === '') {
        who = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (wid !== 0) whereClause += `wwid = ${wid} AND `
  if (title !== '') whereClause += `wtitle ILIKE '%${title}%' AND `
  if (who !== '') whereClause += `wwho ILIKE '%${who}%' AND `
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
//  Who totals
//---------------------------------------------------------------------
export async function fetchWhoTotalPages(query: string) {
  const functionName = 'fetchWhoTotalPages'
  // noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Who(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM who
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
//  Write Who
//---------------------------------------------------------------------
export async function writeWho(wwho: string, wtitle: string) {
  const functionName = 'writeWho'
  try {
    const { rows } = await sql`
    INSERT INTO who (
      wwho,
      wtitle
    ) VALUES (
      ${wwho},
      ${wtitle}
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
//  Update Who
//---------------------------------------------------------------------
export async function updateWho(wwid: number, wwho: string, wtitle: string) {
  const functionName = 'updateWho'
  try {
    const { rows } = await sql`
    UPDATE who
    SET
      wwho = ${wwho},
      wtitle = ${wtitle}
    WHERE wwid = ${wwid}
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
//  Who data by ID
//---------------------------------------------------------------------
export async function fetchWhoByID(wwid: number) {
  const functionName = 'fetchWhoByID'
  // noStore()
  try {
    const data = await sql<table_Who>`
      SELECT *
      FROM who
      WHERE wwid = ${wwid};
    `
    const row = data.rows[0]
    return row
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Who data by Who
//---------------------------------------------------------------------
export async function fetchWhoByWho(wwho: string) {
  const functionName = 'fetchWhoByWho'
  // noStore()
  try {
    const data = await sql<table_Who>`
      SELECT *
      FROM who
      WHERE wwho = ${wwho};
    `
    const row = data.rows[0]
    return row
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
