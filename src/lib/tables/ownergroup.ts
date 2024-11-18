'use server'

import { table_Ownergroup } from '@/src/lib/tables/definitions'
import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { writeLogging } from '@/src/lib/tables/logging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Fetch owner group table
//---------------------------------------------------------------------
export async function fetch_ownergroup1(ogowner: string, oggroup: string) {
  const functionName = 'fetch_ownergroup1'
  noStore()
  try {
    const data = await sql<table_Ownergroup>`
      SELECT *
      FROM ownergroup
      WHERE
        ogowner = ${ogowner} AND
        oggroup = ${oggroup}
      ;
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
//  Delete ownergroup and related tables rows by ID
//---------------------------------------------------------------------
export async function deleteById(oggid: number): Promise<string> {
  const functionName = 'deleteById'
  noStore()
  //
  //  Counts
  //
  const deletedCounts = {
    ownergroup: 0
  }

  try {
    const userDeleteResult = await sql`DELETE FROM ownergroup WHERE oggid=${oggid}`
    deletedCounts.ownergroup = userDeleteResult.rowCount ?? 0
    //
    // Prepare a summary message
    //
    const summaryMessage = `
      Deleted Records:
      ownergroup: ${deletedCounts.ownergroup}
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
//  ownergroup data
//---------------------------------------------------------------------
export async function fetchFiltered(query: string, currentPage: number) {
  const functionName = 'fetchFiltered'
  noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Ownergroup(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM ownergroup
     ${sqlWhere}
      ORDER BY ogowner, oggroup
      LIMIT ${MAINT_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_Ownergroup>(sqlQuery)
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
//  ownergroup where clause
//---------------------------------------------------------------------
export async function buildWhere_Ownergroup(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let gid = 0
  let title = ''
  let owner = ''
  let group = ''
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
        case 'gid':
          if (!isNaN(Number(value))) {
            gid = parseInt(value, 10)
          }
          break
        case 'title':
          title = value
          break
        case 'owner':
          owner = value
          break
        case 'group':
          group = value
          break
        default:
          title = value
          break
      }
    } else {
      // Default to 'title' if no key is provided
      if (title === '') {
        title = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (gid !== 0) whereClause += `oggid = ${gid} AND `
  if (title !== '') whereClause += `ogtitle ILIKE '%${title}%' AND `
  if (owner !== '') whereClause += `ogowner ILIKE '%${owner}%' AND `
  if (group !== '') whereClause += `oggroup ILIKE '%${group}%' AND `
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
//  ownergroup totals
//---------------------------------------------------------------------
export async function fetchPages(query: string) {
  const functionName = 'fetchPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Ownergroup(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM ownergroup
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
export async function writeOwnergroup(ogowner: string, oggroup: string, ogtitle: string) {
  const functionName = 'writeOwnergroup'
  try {
    const { rows } = await sql`
    INSERT INTO ownergroup (
      ogowner,
      oggroup,
      ogtitle
    ) VALUES (
      ${ogowner},
      ${oggroup},
      ${ogtitle}
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
//  Update ownergroup
//---------------------------------------------------------------------
export async function updateOwnergroup(
  oggid: number,
  ogowner: string,
  oggroup: string,
  ogtitle: string
) {
  const functionName = 'updateOwnergroup'
  try {
    const { rows } = await sql`
    UPDATE ownergroup
    SET
      ogowner = ${ogowner},
      oggroup = ${oggroup},
      ogtitle = ${ogtitle}
    WHERE oggid = ${oggid}
    RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
