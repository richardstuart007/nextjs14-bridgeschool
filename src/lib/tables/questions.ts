'use server'

import { sql } from '@vercel/postgres'
import { table_Questions } from '@/src/lib/tables/definitions'
import { writeLogging } from '@/src/lib/tables/logging'
//---------------------------------------------------------------------
//  Questions data by Owner/Group
//---------------------------------------------------------------------
export async function fetchQuestionsByOwnerGroup(qowner: string, qgroup: string) {
  const functionName = 'fetchQuestionsByOwnerGroup'
  // noStore()
  try {
    const data = await sql<table_Questions>`
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
