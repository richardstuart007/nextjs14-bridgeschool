'use server'

import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_Reftype } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  reftype data
//---------------------------------------------------------------------
export async function fetchReftypeFiltered(query: string, currentPage: number) {
  const functionName = 'fetchReftypeFiltered'
  noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_reftype(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM reftype
     ${sqlWhere}
      ORDER BY rttype
      LIMIT ${MAINT_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_Reftype>(sqlQuery)
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
//  reftype where clause
//---------------------------------------------------------------------
export async function buildWhere_reftype(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let rid = 0
  let title = ''
  let type = ''
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
        case 'rid':
          if (!isNaN(Number(value))) {
            rid = parseInt(value, 10)
          }
          break
        case 'title':
          title = value
          break
        case 'type':
          type = value
          break
        default:
          type = value
          break
      }
    } else {
      // Default to 'type' if no key is provided
      if (type === '') {
        type = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (rid !== 0) whereClause += `rtrid = ${rid} AND `
  if (title !== '') whereClause += `rttitle ILIKE '%${title}%' AND `
  if (type !== '') whereClause += `rttype ILIKE '%${type}%' AND `
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
//  reftype totals
//---------------------------------------------------------------------
export async function fetchReftypeTotalPages(query: string) {
  const functionName = 'fetchReftypeTotalPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_reftype(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM reftype
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
