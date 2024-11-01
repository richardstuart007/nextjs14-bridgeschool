'use server'

import { signOut } from '@/auth'
import { navsignout } from '@/app/lib/data'
// ----------------------------------------------------------------------
//  Sign out
// ----------------------------------------------------------------------
export async function logout() {
  await navsignout()
  await signOut({ redirectTo: '/login' })
}
