'use server'

import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_LibraryGroup } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
const LIBRARY_ITEMS_PER_PAGE = 10
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Library totals
//---------------------------------------------------------------------
export async function fetchLibraryUserTotalPages(query: string, uid: number) {
  const functionName = 'fetchLibraryUserTotalPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_LibraryUser(query, uid)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM library
    LEFT JOIN usersowner ON lrowner = uoowner
    LEFT JOIN ownergroup ON lrowner = ogowner and lrgroup = oggroup
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
    const totalPages = Math.ceil(count / LIBRARY_ITEMS_PER_PAGE)
    return totalPages
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Library data
//---------------------------------------------------------------------
export async function fetchLibraryUserFiltered(query: string, currentPage: number, uid: number) {
  const functionName = 'fetchLibraryUserFiltered'
  noStore()
  const offset = (currentPage - 1) * LIBRARY_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_LibraryUser(query, uid)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM library
    LEFT JOIN usersowner ON lrowner = uoowner
    LEFT JOIN ownergroup ON lrgid = oggid
     ${sqlWhere}
      ORDER BY lrref
      LIMIT ${LIBRARY_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_LibraryGroup>(sqlQuery)
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
//  Library where clause
//---------------------------------------------------------------------
export async function buildWhere_LibraryUser(query: string, uid: number) {
  //
  //  Empty search
  //
  if (!query) return `WHERE uouid = ${uid}`
  //
  // Initialize variables
  //
  let lid = 0
  let ref = ''
  let desc = ''
  let who = ''
  let type = ''
  let owner = ''
  let group = ''
  let gid = 0
  let cnt = 0
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
        case 'lid':
          if (!isNaN(Number(value))) {
            lid = parseInt(value, 10)
          }
          break
        case 'ref':
          ref = value
          break
        case 'desc':
          desc = value
          break
        case 'who':
          who = value
          break
        case 'type':
          type = value
          break
        case 'owner':
          owner = value
          break
        case 'group':
          group = value
          break
        case 'gid':
          if (!isNaN(Number(value))) {
            gid = parseInt(value, 10)
          }
          break
        case 'cnt':
          if (!isNaN(Number(value))) {
            cnt = parseInt(value, 10)
          }
          break
        default:
          desc = value
          break
      }
    } else {
      // Default to 'desc' if no key is provided
      if (desc === '') {
        desc = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (lid !== 0) whereClause += `lrlid = ${lid} AND `
  if (ref !== '') whereClause += `lrref ILIKE '%${ref}%' AND `
  if (desc !== '') whereClause += `lrdesc ILIKE '%${desc}%' AND `
  if (who !== '') whereClause += `lrwho ILIKE '%${who}%' AND `
  if (type !== '') whereClause += `lrtype ILIKE '%${type}%' AND `
  if (owner !== '') whereClause += `lrowner ILIKE '%${owner}%' AND `
  if (group !== '') whereClause += `lrgroup ILIKE '%${group}%' AND `
  if (gid !== 0) whereClause += `lrgid = ${gid} AND `
  if (cnt !== 0) whereClause += `ogcntquestions >= ${cnt} AND `
  //
  // Remove the trailing 'AND' if there are conditions
  //
  let whereClauseUpdate = `WHERE uouid = ${uid}`
  if (whereClause !== '') {
    whereClauseUpdate = `${whereClauseUpdate} AND ${whereClause.slice(0, -5)}`
  }
  return whereClauseUpdate
}
//---------------------------------------------------------------------
//  Library totals
//---------------------------------------------------------------------
export async function fetchLibraryTotalPages(query: string) {
  const functionName = 'fetchLibraryTotalPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Library(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM library
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
//  Library data
//---------------------------------------------------------------------
export async function fetchLibraryFiltered(query: string, currentPage: number) {
  const functionName = 'fetchLibraryFiltered'
  noStore()
  const offset = (currentPage - 1) * MAINT_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Library(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM library
     ${sqlWhere}
      ORDER BY lrlid
      LIMIT ${MAINT_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_LibraryGroup>(sqlQuery)
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
//  Library where clause
//---------------------------------------------------------------------
export async function buildWhere_Library(query: string) {
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let lid = 0
  let ref = ''
  let desc = ''
  let who = ''
  let type = ''
  let owner = ''
  let group = ''
  let gid = 0
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
        case 'lid':
          if (!isNaN(Number(value))) {
            lid = parseInt(value, 10)
          }
          break
        case 'ref':
          ref = value
          break
        case 'desc':
          desc = value
          break
        case 'who':
          who = value
          break
        case 'type':
          type = value
          break
        case 'owner':
          owner = value
          break
        case 'group':
          group = value
          break
        case 'gid':
          if (!isNaN(Number(value))) {
            gid = parseInt(value, 10)
          }
          break
        default:
          desc = value
          break
      }
    } else {
      // Default to 'desc' if no key is provided
      if (desc === '') {
        desc = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (lid !== 0) whereClause += `lrlid = ${lid} AND `
  if (ref !== '') whereClause += `lrref ILIKE '%${ref}%' AND `
  if (desc !== '') whereClause += `lrdesc ILIKE '%${desc}%' AND `
  if (who !== '') whereClause += `lrwho ILIKE '%${who}%' AND `
  if (type !== '') whereClause += `lrtype ILIKE '%${type}%' AND `
  if (owner !== '') whereClause += `lrowner ILIKE '%${owner}%' AND `
  if (group !== '') whereClause += `lrgroup ILIKE '%${group}%' AND `
  if (gid !== 0) whereClause += `lrgid = ${gid} AND `
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
//  Write Library
//---------------------------------------------------------------------
export async function writeLibrary(
  lrdesc: string,
  lrlink: string,
  lrwho: string,
  lrtype: string,
  lrowner: string,
  lrref: string,
  lrgroup: string,
  lrgid: number
) {
  const functionName = 'writeLibrary'
  try {
    const { rows } = await sql`
    INSERT INTO library (
      lrdesc,
      lrlink,
      lrwho,
      lrtype,
      lrowner,
      lrref,
      lrgroup,
      lrgid
    ) VALUES (
      ${lrdesc},
      ${lrlink},
      ${lrwho},
      ${lrtype},
      ${lrowner},
      ${lrref},
      ${lrgroup},
      ${lrgid}
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
//  Update Library
//---------------------------------------------------------------------
export async function updateLibrary(
  lrlid: number,
  lrdesc: string,
  lrlink: string,
  lrwho: string,
  lrtype: string,
  lrowner: string,
  lrref: string,
  lrgroup: string,
  lrgid: number
) {
  const functionName = 'updateLibrary'
  try {
    const { rows } = await sql`
    UPDATE library
    SET
      lrdesc = ${lrdesc},
      lrlink = ${lrlink},
      lrwho = ${lrwho},
      lrtype = ${lrtype},
      lrowner = ${lrowner},
      lrref = ${lrref},
      lrgroup = ${lrgroup},
      lrgid = ${lrgid}
    WHERE lrlid = ${lrlid}
    RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
