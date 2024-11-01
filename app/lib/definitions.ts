import { DateTime } from 'next-auth/providers/kakao'

export type LibraryTable = {
  lrlid: number
  lrref: string
  lrdesc: string
  lrlink: string
  lrwho: string
  lrtype: string
  lrowner: string
  lrgroup: string
  lrgid: number
}

export type LibraryGroupTable = {
  lrlid: number
  lrref: string
  lrdesc: string
  lrlink: string
  lrwho: string
  lrtype: string
  lrowner: string
  lrgroup: string
  lrgid: number
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  oggid: number
}

export type QuestionsTable = {
  qqid: number
  qowner: string
  qdetail: string
  qgroup: string
  qpoints: number[]
  qans: number[]
  qseq: number
  qrounds: string[][] | null
  qnorth: string[] | null
  qeast: string[] | null
  qsouth: string[] | null
  qwest: string[] | null
  qgid: number
}

export type UsershistoryTable = {
  r_hid: number
  r_datetime: DateTime
  r_owner: string
  r_group: string
  r_questions: number
  r_qid: number[]
  r_ans: number[]
  r_uid: number
  r_points: number[]
  r_maxpoints: number
  r_totalpoints: number
  r_correctpercent: number
  r_gid: number
  r_sid: number
}

export type NewUsershistoryTable = Omit<UsershistoryTable, 'r_hid'>

export type HistoryGroupTable = {
  r_hid: number
  r_datetime: DateTime
  r_owner: string
  r_group: string
  r_questions: number
  r_qid: number[]
  r_ans: number[]
  r_uid: number
  r_points: number[]
  r_maxpoints: number
  r_totalpoints: number
  r_correctpercent: number
  r_gid: number
  r_sid: number
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  u_name: string
}

export type OwnergroupTable = {
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  oggid: number
}

export type SessionsTable = {
  s_id: number
  s_datetime: DateTime
  s_uid: number
  s_signedin: boolean
  s_sortquestions: boolean
  s_skipcorrect: boolean
  s_dftmaxquestions: number
}

export type SessionInfo = {
  bsuid: number
  bsname: string
  bsemail: string
  bsadmin: boolean
  bsid: number
  bssignedin: boolean
  bssortquestions: boolean
  bsskipcorrect: boolean
  bsdftmaxquestions: number
}

export type ContextInfo = {
  cxuid: number
  cxid: number
}

export type UserAuth = {
  id: string
  name: string
  email: string
  password: string
}

export type UsersTable = {
  u_uid: number
  u_name: string
  u_email: string
  u_joined: DateTime
  u_fedid: string
  u_admin: boolean
  u_fedcountry: string
  u_provider: string
}

export type UserspwdTable = {
  upuid: number
  upemail: string
  uphash: string
}

export type UsersOwnerTable = {
  uouid: number
  uoowner: string
}

export interface UsershistoryTopResults {
  r_uid: number
  u_name: string
  record_count: number
  total_points: number
  total_maxpoints: number
  percentage: number
}

export interface UsershistoryRecentResults {
  r_hid: number
  r_uid: number
  u_name: string
  r_totalpoints: number
  r_maxpoints: number
  r_correctpercent: number
}

export interface ProviderSignInParams {
  provider: string
  email: string
  name: string
}

export type LoggingTable = {
  lgid: number
  lgdatetime: DateTime
  lgmsg: string
  lgfunctionname: string
  lgsession: number
}

export type reftypeTable = {
  rttype: string
  rttitle: string
  rtrid: number
}

export type ownerTable = {
  oowner: string
  otitle: string
  ooid: number
}

export type ownergroupTable = {
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  oggid: number
}

export type usersownerTable = {
  uouid: number
  uoowner: string
}

export type whoTable = {
  wwho: string
  wtitle: string
  wwid: number
}
