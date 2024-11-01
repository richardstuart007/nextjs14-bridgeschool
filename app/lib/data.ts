'use server'

import { sql, db } from '@vercel/postgres'
import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import {
  LibraryTable,
  LibraryGroupTable,
  QuestionsTable,
  UsersTable,
  UserspwdTable,
  UsersOwnerTable,
  UsershistoryTable,
  HistoryGroupTable,
  UsershistoryTopResults,
  UsershistoryRecentResults,
  NewUsershistoryTable,
  SessionsTable,
  SessionInfo,
  ProviderSignInParams,
  reftypeTable,
  ownerTable,
  ownergroupTable,
  usersownerTable,
  whoTable
} from './definitions'
const LIBRARY_ITEMS_PER_PAGE = 10
const HISTORY_ITEMS_PER_PAGE = 10
const USERS_ITEMS_PER_PAGE = 15
const MAINT_ITEMS_PER_PAGE = 15
//---------------------------------------------------------------------
//  Library totals
//---------------------------------------------------------------------
export async function fetchLibraryUserTotalPages(query: string, uid: number) {
  const functionName = 'fetchLibraryUserTotalPages'
  // noStore()
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
  // noStore()
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
    const data = await client.query<LibraryGroupTable>(sqlQuery)
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
  // noStore()
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
  // noStore()
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
    const data = await client.query<LibraryGroupTable>(sqlQuery)
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
//  Library data by ID
//---------------------------------------------------------------------
export async function fetchLibraryById(lrlid: number) {
  const functionName = 'fetchLibraryById'
  // noStore()
  try {
    const data = await sql<LibraryTable>`
      SELECT *
      FROM library
      WHERE lrlid = ${lrlid};
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
//  Library data by ref/group/owner - unique
//---------------------------------------------------------------------
export async function fetchLibraryByRefGroupOwner(lrref: string, lrgroup: string, lrowner: string) {
  const functionName = 'fetchLibraryByRefGroupOwner'
  // noStore()
  try {
    const data = await sql<LibraryTable>`
      SELECT *
      FROM library
      WHERE 
        lrref = ${lrref} and
        lrgroup = ${lrgroup} and
        lrowner = ${lrowner};
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
//  Delete Library and related tables rows by ID
//---------------------------------------------------------------------
export async function deleteLibraryById(lrlid: number): Promise<string> {
  const functionName = 'deleteLibraryById'
  noStore()
  //
  //  Counts
  //
  const deletedCounts = {
    library: 0
  }

  try {
    const userDeleteResult = await sql`DELETE FROM library WHERE lrlid=${lrlid}`
    deletedCounts.library = userDeleteResult.rowCount ?? 0
    //
    // Prepare a summary message
    //
    const summaryMessage = `
      Deleted Records:
      Library: ${deletedCounts.library}
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
//  Questions data by Owner/Group
//---------------------------------------------------------------------
export async function fetchQuestionsByOwnerGroup(qowner: string, qgroup: string) {
  const functionName = 'fetchQuestionsByOwnerGroup'
  // noStore()
  try {
    const data = await sql<QuestionsTable>`
      SELECT *
      FROM questions
      WHERE qowner = ${qowner} and qgroup = ${qgroup}
      ORDER BY qowner, qgroup, qseq;
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
//  Questions data by ID
//---------------------------------------------------------------------
export async function fetchQuestionsByGid(qgid: number) {
  const functionName = 'fetchQuestionsByGid'
  // noStore()
  try {
    const data = await sql<QuestionsTable>`
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
//  History totals
//---------------------------------------------------------------------
export async function fetchHistoryTotalPages(query: string) {
  const functionName = 'fetchHistoryTotalPages'
  // noStore()
  try {
    let sqlWhere = await buildWhere_History(query)
    const sqlQuery = `
    SELECT COUNT(*)
    FROM usershistory
    ${sqlWhere}`

    const client = await db.connect()
    const result = await client.query(sqlQuery)
    const count = result.rows[0].count
    client.release()

    const totalPages = Math.ceil(count / HISTORY_ITEMS_PER_PAGE)
    return totalPages
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  History data
//---------------------------------------------------------------------
export async function fetchHistoryFiltered(query: string, currentPage: number) {
  const functionName = 'fetchHistoryFiltered'
  // noStore()
  const offset = (currentPage - 1) * HISTORY_ITEMS_PER_PAGE
  try {
    let sqlWhere = await buildWhere_History(query)
    const sqlQuery = `
    SELECT *
    FROM usershistory
    LEFT JOIN ownergroup ON r_gid = oggid
    LEFT JOIN users ON r_uid = u_uid
     ${sqlWhere}
      ORDER BY r_hid DESC
      LIMIT ${HISTORY_ITEMS_PER_PAGE} OFFSET ${offset}
     `
    const client = await db.connect()
    const data = await client.query<HistoryGroupTable>(sqlQuery)
    client.release()
    const rows = data.rows
    return rows
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  History where clause
//---------------------------------------------------------------------
export async function buildWhere_History(query: string) {
  const functionName = 'buildWhere_History'
  //
  //  Empty search
  //
  let whereClause = ''
  if (!query) return whereClause
  //
  // Initialize variables
  //
  let hid = 0
  let owner = ''
  let group = ''
  let cnt = 0
  let uid = 0
  let correct = 0
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
        case 'hid':
          if (!isNaN(Number(value))) {
            hid = parseInt(value, 10)
          }
          break
        case 'uid':
          if (!isNaN(Number(value))) {
            uid = parseInt(value, 10)
          }
          break
        case 'correct':
          if (!isNaN(Number(value))) {
            correct = parseInt(value, 10)
          }
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
          group = value
          break
      }
    } else {
      // Default to 'group' if no key is provided
      if (group === '') {
        group = part
      }
    }
  })
  //
  // Add conditions for each variable if not empty or zero
  //
  if (hid !== 0) whereClause += `r_hid = ${hid} AND `
  if (uid !== 0) whereClause += `r_uid = ${uid} AND `
  if (owner !== '') whereClause += `r_owner ILIKE '%${owner}%' AND `
  if (group !== '') whereClause += `r_group ILIKE '%${group}%' AND `
  if (cnt !== 0) whereClause += `ogcntquestions >= ${cnt} AND `
  if (correct !== 0) whereClause += `r_correctpercent >= ${correct} AND `
  if (gid !== 0) whereClause += `r_gid = ${gid} AND `
  //
  // Remove the trailing 'AND' if there are conditions
  //
  if (whereClause !== '') {
    whereClause = `WHERE ${whereClause.slice(0, -5)}`
  }
  return whereClause
}
//---------------------------------------------------------------------
//  History data by ID
//---------------------------------------------------------------------
export async function fetchHistoryById(r_hid: number) {
  const functionName = 'fetchHistoryById'
  // noStore()
  try {
    const data = await sql<UsershistoryTable>`
      SELECT *
      FROM usershistory
      WHERE r_hid = ${r_hid};
    `
    //
    //  Return rows
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
//  Fetch User by email
//---------------------------------------------------------------------
export async function fetchUserByEmail(email: string): Promise<UsersTable | undefined> {
  const functionName = 'fetchUserByEmail'
  noStore()
  try {
    const userrecord = await sql<UsersTable>`SELECT * FROM users WHERE u_email=${email}`
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
export async function fetchUserPwdByEmail(email: string): Promise<UserspwdTable | undefined> {
  const functionName = 'fetchUserPwdByEmail'
  noStore()
  try {
    const data = await sql<UserspwdTable>`SELECT * FROM userspwd WHERE upemail=${email}`
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
export async function fetchUserById(uid: number): Promise<UsersTable | undefined> {
  const functionName = 'fetchUserById'
  noStore()
  try {
    const userrecord = await sql<UsersTable>`SELECT * FROM users WHERE u_uid=${uid}`
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
//  Top results data
//---------------------------------------------------------------------
export async function fetchTopResultsData() {
  const functionName = 'fetchTopResultsData'
  // noStore()
  // ????????????
  // await new Promise(resolve => setTimeout(resolve, 3000))
  try {
    const data = await sql<UsershistoryTopResults>`
      SELECT
        r_uid,
        u_name,
        COUNT(*) AS record_count,
        SUM(r_totalpoints) AS total_points,
        SUM(r_maxpoints) AS total_maxpoints,
        CASE
          WHEN SUM(r_maxpoints) > 0 THEN ROUND((SUM(r_totalpoints) / CAST(SUM(r_maxpoints) AS NUMERIC)) * 100)::INTEGER
          ELSE 0
        END AS percentage
      FROM
        usershistory
      JOIN
        users ON r_uid = u_uid
      GROUP BY
        r_uid, u_name
      HAVING
        COUNT(*) >= 3
      ORDER BY
        percentage DESC
      LIMIT 5;
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
//  Recent result data last
//---------------------------------------------------------------------
export async function fetchRecentResultsData1() {
  const functionName = 'fetchRecentResultsData1'
  // noStore()
  // ????????????
  // await new Promise(resolve => setTimeout(resolve, 3000))
  try {
    const data = await sql<UsershistoryRecentResults>`
  SELECT
    r_hid, r_uid, u_name, r_totalpoints, r_maxpoints, r_correctpercent
  FROM (
          SELECT
            r_hid,
            r_uid,
            u_name,
            r_totalpoints,
            r_maxpoints,
            r_correctpercent,
            ROW_NUMBER()
            OVER (PARTITION BY r_uid ORDER BY r_hid DESC) AS rn
          FROM usershistory
          JOIN users
            ON r_uid = u_uid
        )
  AS ranked
  WHERE rn = 1
  ORDER BY
    r_hid DESC
  LIMIT 5;
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
//  Recent results data
//---------------------------------------------------------------------
export async function fetchRecentResultsData5(userIds: number[]) {
  const functionName = 'fetchRecentResultsData5'
  // noStore()
  // ????????????
  // await new Promise(resolve => setTimeout(resolve, 3000))
  try {
    const [id1, id2, id3, id4, id5] = userIds

    const data = await sql<UsershistoryRecentResults>`
SELECT r_hid, r_uid, u_name, r_totalpoints, r_maxpoints, r_correctpercent
FROM (
    SELECT
        r_hid, r_uid, u_name, r_totalpoints, r_maxpoints, r_correctpercent,
        ROW_NUMBER() OVER (PARTITION BY r_uid ORDER BY r_hid DESC) AS rn
    FROM usershistory
    JOIN users ON r_uid = u_uid
       WHERE r_uid IN (${id1}, ${id2}, ${id3}, ${id4}, ${id5})
) AS ranked
WHERE rn <= 5
ORDER BY r_uid;
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
//  Write User History
//---------------------------------------------------------------------
export async function writeUsershistory(NewUsershistoryTable: NewUsershistoryTable) {
  const functionName = 'writeUsershistory'
  try {
    //
    //  Deconstruct history
    //
    const {
      r_datetime,
      r_owner,
      r_group,
      r_questions,
      r_qid,
      r_ans,
      r_uid,
      r_points,
      r_maxpoints,
      r_totalpoints,
      r_correctpercent,
      r_gid,
      r_sid
    } = NewUsershistoryTable

    const r_qid_string = `{${r_qid.join(',')}}`
    const r_ans_string = `{${r_ans.join(',')}}`
    const r_points_string = `{${r_points.join(',')}}`

    const { rows } = await sql`INSERT INTO Usershistory
    (r_datetime, r_owner, r_group, r_questions, r_qid, r_ans, r_uid, r_points,
       r_maxpoints, r_totalpoints, r_correctpercent, r_gid, r_sid)
    VALUES (${r_datetime}, ${r_owner},${r_group},${r_questions},${r_qid_string},${r_ans_string},${r_uid},${r_points_string},
      ${r_maxpoints},${r_totalpoints},${r_correctpercent},${r_gid},${r_sid})
    RETURNING *`
    const UsershistoryTable = rows[0]
    return UsershistoryTable
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Write User Sessions
//---------------------------------------------------------------------
export async function writeSessions(s_uid: number) {
  const functionName = 'writeSessions'
  try {
    const s_datetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
    const { rows } = await sql`
    INSERT INTO sessions (
      s_datetime,
      s_uid
    ) VALUES (
      ${s_datetime},
      ${s_uid}
    ) RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
//---------------------------------------------------------------------
//  Update Sessions to signed out
//---------------------------------------------------------------------
export async function SessionsSignout(s_id: number) {
  const functionName = 'SessionsSignout'
  try {
    await sql`
    UPDATE sessions
    SET
      s_signedin = false
    WHERE s_id = ${s_id}
    `
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'SessionsSignout: Failed to Update session.'
    }
  }
}
//---------------------------------------------------------------------
//  Update User Sessions to signed out - ALL
//---------------------------------------------------------------------
export async function SessionsSignoutAll() {
  const functionName = 'SessionsSignoutAll'
  try {
    await sql`
    UPDATE sessions
    SET
      s_signedin = false
    WHERE 
      s_signedin = true AND
      s_datetime < NOW() - INTERVAL '3 HOURS'
    `
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'SessionsSignoutAll: Failed to Update ssession.'
    }
  }
}
//---------------------------------------------------------------------
//  sessions data by ID
//---------------------------------------------------------------------
export async function fetchSessionsById(s_id: number) {
  const functionName = 'fetchSessionsById'
  noStore()
  try {
    const data = await sql<SessionsTable>`
      SELECT *
      FROM sessions
      WHERE s_id = ${s_id};
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
//  Update Sessions to signed out
//---------------------------------------------------------------------
export async function UpdateSessions(
  s_id: number,
  s_dftmaxquestions: number,
  s_sortquestions: boolean,
  s_skipcorrect: boolean
) {
  const functionName = 'UpdateSessions'
  try {
    await sql`
    UPDATE sessions
    SET
      s_dftmaxquestions = ${s_dftmaxquestions},
      s_sortquestions = ${s_sortquestions},
      s_skipcorrect = ${s_skipcorrect}
    WHERE s_id = ${s_id}
    `
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return {
      message: 'UpdateSessions: Failed to Update session.'
    }
  }
}
//---------------------------------------------------------------------
//  Fetch SessionInfo data by ID
//---------------------------------------------------------------------
export async function fetchSessionInfo(sessionId: number) {
  const functionName = 'fetchSessionInfo'
  // noStore()
  try {
    const data = await sql`
      SELECT 
        u_uid,
        u_name,
        u_email,
        u_admin,
        s_id,
        s_signedin,
        s_sortquestions,
        s_skipcorrect,
        s_dftmaxquestions
      FROM sessions
      JOIN users
      ON   s_uid = u_uid
      WHERE s_id = ${sessionId};
    `

    const row = data.rows[0]
    const SessionInfo: SessionInfo = {
      bsuid: row.u_uid,
      bsname: row.u_name,
      bsemail: row.u_email,
      bsadmin: row.u_admin,
      bsid: row.s_id,
      bssignedin: row.s_signedin,
      bssortquestions: row.s_sortquestions,
      bsskipcorrect: row.s_skipcorrect,
      bsdftmaxquestions: row.s_dftmaxquestions
    }
    return SessionInfo
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Update Cookie information
// ----------------------------------------------------------------------
export async function updateCookieSessionId(sessionId: number) {
  const functionName = 'updateCookieSessionId'
  try {
    //
    //  Cookiename
    //
    const cookieName = 'SessionId'
    //
    //  Write the cookie
    //
    const JSON_cookie = JSON.stringify(sessionId)
    cookies().set(cookieName, JSON_cookie, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/'
    })
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Delete Cookie
// ----------------------------------------------------------------------
export async function deleteCookie(cookieName: string = 'SessionId') {
  const functionName = 'deleteCookie'
  try {
    cookies().delete(cookieName)
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Get Cookie information
// ----------------------------------------------------------------------
export async function getCookieSessionId(cookieName: string = 'SessionId'): Promise<string | null> {
  const functionName = 'getCookieSessionId'
  try {
    const cookie = cookies().get(cookieName)
    if (!cookie) return null
    //
    //  Get value
    //
    const decodedCookie = decodeURIComponent(cookie.value)
    if (!decodedCookie) return null
    //
    //  Convert to JSON
    //
    const JSON_cookie = JSON.parse(decodedCookie)
    if (!JSON_cookie) return null
    //
    //  Return JSON
    //
    return JSON_cookie
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    return null
  }
}
// ----------------------------------------------------------------------
//  Determine if Admin User
// ----------------------------------------------------------------------
export async function isAdmin() {
  const functionName = 'isAdmin'
  //
  //  Get session id
  //
  const cookie = await getCookieSessionId()
  //
  //  No cookie then not logged in
  //
  if (!cookie) return false
  //
  //  Session ID
  //
  const sessionId = parseInt(cookie, 10)
  //
  //  Session info
  //
  const sessionInfo = await fetchSessionInfo(sessionId)
  //
  //  Return admin flag
  //
  return sessionInfo.bsadmin
}
// ----------------------------------------------------------------------
//  Nav signout
// ----------------------------------------------------------------------
export async function navsignout() {
  const functionName = 'navsignout'
  try {
    //
    //  Get the Bridge School session cookie
    //
    const sessionId = await getCookieSessionId()
    if (!sessionId) return
    //
    //  Update the session to signed out
    //
    const s_id = parseInt(sessionId, 10)
    await SessionsSignout(s_id)
    //
    //  Delete the cookie
    //
    await deleteCookie('SessionId')
    //
    //  Errors
    //
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
//  Write UserOwner records
// ----------------------------------------------------------------------
export async function writeUsersOwner(userid: number) {
  const functionName = 'writeUsersOwner'
  //
  // Insert data into the database
  //
  const uouid = userid
  const uoowner = 'Richard'
  try {
    const { rows } = await sql`
    INSERT
      INTO usersowner
       (
        uouid,
        uoowner
        )
    VALUES (
      ${uouid},
      ${uoowner}
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
// ----------------------------------------------------------------------
//  Google Provider
// ----------------------------------------------------------------------
export async function providerSignIn({ provider, email, name }: ProviderSignInParams) {
  const functionName = 'providerSignIn'
  try {
    //
    //  Get user from database
    //
    let userRecord: UsersTable | undefined
    userRecord = (await fetchUserByEmail(email)) as UsersTable | undefined
    //
    //  Create user if does not exist
    //
    if (!userRecord) {
      userRecord = (await writeUser(provider, email, name)) as UsersTable | undefined
      if (!userRecord) {
        throw Error('providerSignIn: Write User Error')
      }
      //
      //  Write the usersowner data
      //
      const userid = userRecord.u_uid
      ;(await writeUsersOwner(userid)) as UsersOwnerTable
    }
    //
    // Write session information
    //
    const { u_uid } = userRecord
    const sessionsRecord = await writeSessions(u_uid)
    //
    // Write cookie session
    //
    const sessionId = sessionsRecord.s_id
    await updateCookieSessionId(sessionsRecord.s_id)
    //
    //  Return Session ID
    //
    return sessionId
    //
    //  Errors
    //
  } catch (error) {
    console.error(`${functionName}:`, error)
    writeLogging(functionName, 'Function failed')
    throw new Error(`${functionName}: Failed`)
  }
}
// ----------------------------------------------------------------------
//  Get Auth Session information
// ----------------------------------------------------------------------
export async function getAuthSession() {
  const functionName = 'getAuthSession'
  try {
    const session = await auth()
    return session
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
  // noStore()
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
    const data = await client.query<UsersTable>(sqlQuery)
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
  // noStore()
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
//---------------------------------------------------------------------
//  Delete by a User and related tables rows by UID - users, sessions, usershistory,usersowner, userspwd
//---------------------------------------------------------------------
export async function deleteByUid(uid: number): Promise<string> {
  const functionName = 'deleteByUid'
  noStore()
  //
  //  Counts
  //
  const deletedCounts = {
    users: 0,
    sessions: 0,
    usersHistory: 0,
    usersOwner: 0,
    usersPwd: 0
  }

  try {
    //
    // usershistory
    //
    const usersHistoryDeleteResult = await sql`DELETE FROM usershistory WHERE r_uid=${uid}`
    deletedCounts.usersHistory = usersHistoryDeleteResult.rowCount ?? 0
    //
    // sessions
    //
    const sessionDeleteResult = await sql`DELETE FROM sessions WHERE s_uid=${uid}`
    deletedCounts.sessions = sessionDeleteResult.rowCount ?? 0
    //
    // usersowner
    //
    const usersOwnerDeleteResult = await sql`DELETE FROM usersowner WHERE uouid=${uid}`
    deletedCounts.usersOwner = usersOwnerDeleteResult.rowCount ?? 0
    //
    // userspwd
    //
    const usersPwdDeleteResult = await sql`DELETE FROM userspwd WHERE upuid=${uid}`
    deletedCounts.usersPwd = usersPwdDeleteResult.rowCount ?? 0
    //
    // users
    //
    const userDeleteResult = await sql`DELETE FROM users WHERE u_uid=${uid}`
    deletedCounts.users = userDeleteResult.rowCount ?? 0
    //
    // Prepare a summary message
    //
    const summaryMessage = `
      Deleted Records:
      Users: ${deletedCounts.users}
      Sessions: ${deletedCounts.sessions}
      Users History: ${deletedCounts.usersHistory}
      Users Owner: ${deletedCounts.usersOwner}
      Users Passwords: ${deletedCounts.usersPwd}
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
//  Write User Logging
//---------------------------------------------------------------------
export async function writeLogging(lgfunctionname: string, lgmsg: string) {
  //
  //  Get session id
  //
  let lgsession = 0
  const cookie = await getCookieSessionId()
  if (cookie) lgsession = parseInt(cookie, 10)

  try {
    const lgdatetime = new Date().toISOString().replace('T', ' ').replace('Z', '').substring(0, 23)
    const { rows } = await sql`
    INSERT INTO logging (
      lgdatetime,
      lgmsg,
      lgfunctionname,
      lgsession
    ) VALUES (
      ${lgdatetime},
      ${lgmsg},
      ${lgfunctionname},
      ${lgsession}
    ) RETURNING *
  `
    return rows[0]
  } catch (error) {
    console.error('writeLogging:', error)
    throw new Error('writeLogging: Failed')
  }
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
//---------------------------------------------------------------------
//  Fetch reftype
//---------------------------------------------------------------------
export async function fetch_reftype() {
  const functionName = 'fetch_reftype'
  // noStore()
  try {
    const data = await sql<reftypeTable>`
      SELECT *
      FROM reftype
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
//  Fetch owner table
//---------------------------------------------------------------------
export async function fetch_owner() {
  const functionName = 'fetch_owner'
  // noStore()
  try {
    const data = await sql<ownerTable>`
      SELECT *
      FROM owner
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
//  Fetch owner group table
//---------------------------------------------------------------------
export async function fetch_ownergroup(ogowner: string) {
  const functionName = 'fetch_ownergroup'
  // noStore()
  try {
    const data = await sql<ownergroupTable>`
      SELECT *
      FROM ownergroup
      WHERE ogowner = ${ogowner}
      ORDER BY ogowner, oggroup
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
//  Fetch owner group table
//---------------------------------------------------------------------
export async function fetch_ownergroup1(ogowner: string, oggroup: string) {
  const functionName = 'fetch_ownergroup1'
  // noStore()
  try {
    const data = await sql<ownergroupTable>`
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
//  Fetch owners for user table
//---------------------------------------------------------------------
export async function fetch_usersownergroup(uouid: number) {
  const functionName = 'fetch_usersownergroup'
  // noStore()
  try {
    const data = await sql<usersownerTable>`
      SELECT *
      FROM usersowner
      WHERE uouid = ${uouid}
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
//  Fetch who table
//---------------------------------------------------------------------
export async function fetch_who() {
  const functionName = 'fetch_who'
  // noStore()
  try {
    const data = await sql<whoTable>`
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
