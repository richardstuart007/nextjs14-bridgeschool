'use server'

import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { table_Users, table_Userspwd } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/tableSpecific/logging'
import bcrypt from 'bcryptjs'

const USERS_ITEMS_PER_PAGE = 15

//---------------------------------------------------------------------
//  Fetch User by email
//---------------------------------------------------------------------
export async function fetchUserByEmail(email: string): Promise<table_Users | undefined> {
  const functionName = 'fetchUserByEmail'
  noStore()
  try {
    const userrecord = await sql<table_Users>`SELECT * FROM users WHERE u_email=${email}`
    //
    //  Not found
    //
    if (userrecord.rowCount === 0) {
      return undefined
    }
    //
    //  Return data
    //
    const row = userrecord.rows[0]
    return row
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Fetch Userpwd by email
//---------------------------------------------------------------------
export async function fetchUserPwdByEmail(email: string): Promise<table_Userspwd | undefined> {
  const functionName = 'fetchUserPwdByEmail'
  noStore()
  try {
    const data = await sql<table_Userspwd>`SELECT * FROM userspwd WHERE upemail=${email}`
    //
    //  Not found
    //
    if (data.rowCount === 0) {
      return undefined
    }
    //
    //  Return data
    //
    const row = data.rows[0]
    return row
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Fetch User by ID
//---------------------------------------------------------------------
export async function fetchUserById(uid: number): Promise<table_Users | undefined> {
  const functionName = 'fetchUserById'
  noStore()
  try {
    const userrecord = await sql<table_Users>`SELECT * FROM users WHERE u_uid=${uid}`
    //
    //  Not found
    //
    if (userrecord.rowCount === 0) {
      return undefined
    }
    //
    //  Return data
    //
    const row = userrecord.rows[0]
    return row
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Write New User
// ----------------------------------------------------------------------
export async function writeUser(provider: string, email: string, name?: string) {
  const functionName = 'writeUser'
  //
  // Insert data into the database
  //
  const u_email = email
  //
  //  Get name from email if it does not exist
  //
  let u_name
  name ? (u_name = name) : (u_name = email.split('@')[0])
  //
  //  Use default values
  //
  const u_joined = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const u_fedid = ''
  const u_admin = false
  const u_fedcountry = 'ZZ'
  const u_provider = provider
  try {
    const { rows } = await sql`
    INSERT
      INTO users
       (
        u_email,
        u_name,
        u_joined,
        u_fedid,
        u_admin,
        u_fedcountry,
        u_provider
        )
    VALUES (
      ${u_email},
      ${u_name},
      ${u_joined},
      ${u_fedid},
      ${u_admin},
      ${u_fedcountry},
      ${u_provider}
     ) RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Write Userpwd record
// ----------------------------------------------------------------------
export async function writeUsersPwd(userid: number, userpwd: string, email: string) {
  const functionName = 'writeUsersPwd'
  //
  // Insert data into the database
  //
  const upuid = userid
  const uphash = await bcrypt.hash(userpwd, 10)
  const upemail = email
  try {
    const { rows } = await sql`
    INSERT
      INTO userspwd
       (
        upuid,
        uphash,
        upemail
        )
    VALUES (
      ${upuid},
      ${uphash},
      ${upemail}
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
// ----------------------------------------------------------------------
//  Update Userspwd record
// ----------------------------------------------------------------------
export async function updateUsersPwd(userid: number, userpwd: string) {
  const functionName = 'updateUsersPwd'
  //
  // Encrypt the password
  //
  const upuid = userid
  const uphash = await bcrypt.hash(userpwd, 10)
  //
  // Update the data
  //
  try {
    const { rows } = await sql`
    UPDATE userspwd
    SET
      uphash = ${uphash}
    WHERE upuid = ${upuid}
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
//  Users data
//---------------------------------------------------------------------
export async function fetchUsersFiltered(query: string, currentPage: number) {
  const functionName = 'fetchUsersFiltered'
  noStore()
  const offset = (currentPage - 1) * USERS_ITEMS_PER_PAGE
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Users(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT *
    FROM users
     ${sqlWhere}
      ORDER BY u_name
      LIMIT ${USERS_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    //
    //  Run SQL
    //
    const client = await db.connect()
    const data = await client.query<table_Users>(sqlQuery)
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
//  Users totals
//---------------------------------------------------------------------
export async function fetchUsersTotalPages(query: string) {
  const functionName = 'fetchUsersTotalPages'
  noStore()
  try {
    //
    //  Build Where clause
    //
    let sqlWhere = await buildWhere_Users(query)
    //
    //  Build Query Statement
    //
    const sqlQuery = `SELECT COUNT(*)
    FROM users
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
    const totalPages = Math.ceil(count / USERS_ITEMS_PER_PAGE)
    return totalPages
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Users where clause
//---------------------------------------------------------------------
export async function buildWhere_Users(query: string) {
  const functionName = 'buildWhere_Users'
  //
  //  Empty search
  //
  if (!query) return ``
  //
  // Initialize variables
  //
  let uid = 0
  let name = ''
  let email = ''
  let fedid = ''
  let fedcountry = ''
  let provider = ''
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
        case 'uid':
          if (!isNaN(Number(value))) {
            uid = parseInt(value, 10)
          }
          break
        case 'name':
          name = value
          break
        case 'email':
          email = value
          break
        case 'fedid':
          fedid = value
          break
        case 'fedcountry':
          fedcountry = value
          break
        case 'provider':
          provider = value
          break
        default:
          name = value
          break
      }
    } else {
      // Default to 'name' if no key is provided
      if (name === '') {
        name = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  let whereClause = ''
  if (uid !== 0) whereClause += `u_uid = ${uid} AND `
  if (name !== '') whereClause += `u_name ILIKE '%${name}%' AND `
  if (email !== '') whereClause += `u_email ILIKE '%${email}%' AND `
  if (fedid !== '') whereClause += `u_fedid ILIKE '%${fedid}%' AND `
  if (fedcountry !== '') whereClause += `u_fedcountry ILIKE '%${fedcountry}%' AND `
  if (provider !== '') whereClause += `u_provider ILIKE '%${provider}%' AND `
  //
  //  No where clause
  //
  if (whereClause === '') return ''
  //
  // Remove the trailing 'AND' if there are conditions
  //
  const whereClauseUpdate = `WHERE ${whereClause.slice(0, -5)}`
  return whereClauseUpdate
}
