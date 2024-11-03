import { DateTime } from 'next-auth/providers/kakao'

export type table_Library = {
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

export type table_LibraryGroup = {
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

export type table_Questions = {
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

export type table_Usershistory = {
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

export type table_Usershistory_New = Omit<table_Usershistory, 'r_hid'>

export type structure_HistoryGroup = {
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

export type table_Sessions = {
  s_id: number
  s_datetime: DateTime
  s_uid: number
  s_signedin: boolean
  s_sortquestions: boolean
  s_skipcorrect: boolean
  s_dftmaxquestions: number
}

export type structure_SessionsInfo = {
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

export type structure_ContextInfo = {
  cxuid: number
  cxid: number
}

export type structure_UserAuth = {
  id: string
  name: string
  email: string
  password: string
}

export type table_Users = {
  u_uid: number
  u_name: string
  u_email: string
  u_joined: DateTime
  u_fedid: string
  u_admin: boolean
  u_fedcountry: string
  u_provider: string
}

export type table_Userspwd = {
  upuid: number
  upemail: string
  uphash: string
}

export type table_Usersowner = {
  uouid: number
  uoowner: string
}

export interface structure_UsershistoryTopResults {
  r_uid: number
  u_name: string
  record_count: number
  total_points: number
  total_maxpoints: number
  percentage: number
}

export interface structure_UsershistoryRecentResults {
  r_hid: number
  r_uid: number
  u_name: string
  r_totalpoints: number
  r_maxpoints: number
  r_correctpercent: number
}

export interface structure_ProviderSignInParams {
  provider: string
  email: string
  name: string
}

export type table_Logging = {
  lgid: number
  lgdatetime: DateTime
  lgmsg: string
  lgfunctionname: string
  lgsession: number
}

export type table_Reftype = {
  rttype: string
  rttitle: string
  rtrid: number
}

export type table_Owner = {
  oowner: string
  otitle: string
  ooid: number
}

export type table_Ownergroup = {
  ogowner: string
  oggroup: string
  ogtitle: string
  ogcntquestions: number
  ogcntlibrary: number
  oggid: number
}

export type table_Who = {
  wwho: string
  wtitle: string
  wwid: number
}
