const { db } = require('@vercel/postgres')

main().catch(err => {
  console.error('An error occurred while attempting to seed the database:', err)
})

async function main() {
  const client = await db.connect()

  await create_bidding(client)
  await create_dbstats(client)
  await create_hands(client)
  await create_library(client)
  await create_owner(client)
  await create_ownergroup(client)
  await create_questions(client)
  await create_reftype(client)
  await create_sessions(client)
  await create_users(client)
  await create_users_idx(client)
  await create_usershistory(client)
  await create_usersowner(client)
  await create_userspwd(client)
  await create_userspwd_idx(client)
  await create_userssessions(client)
  await create_who(client)

  await client.end()
}

/* --------------------------------------------------------------------*/
async function create_bidding(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS bidding
(
    bqid integer NOT NULL,
    brounds text[],
    CONSTRAINT bidding_pkey PRIMARY KEY (bqid)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding bidding:', error)
    throw error
  }
}

/* --------------------------------------------------------------------*/
async function create_dbstats(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS dbstats
(
    dbkey character(10) NOT NULL,
    dbcount1 integer DEFAULT 0,
    dbcount2 integer DEFAULT 0,
    dbcount3 integer DEFAULT 0,
    CONSTRAINT dbstats_pkey PRIMARY KEY (dbkey)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding dbstats:', error)
    throw error
  }
}

/* --------------------------------------------------------------------*/
async function create_hands(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS hands
(
    hqid integer NOT NULL,
    hnorth text[] ,
    heast text[] ,
    hsouth text[] ,
    hwest text[] ,
    CONSTRAINT hand_pkey PRIMARY KEY (hqid)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding hands:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_library(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS library
(
    lrlid integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 120 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    lrref character varying(32)  NOT NULL,
    lrdesc character varying ,
    lrlink character varying ,
    lrwho character varying ,
    lrtype character varying ,
    lrowner character varying(16)  NOT NULL,
    lrgroup character varying(32)  NOT NULL,
    CONSTRAINT library_pkey PRIMARY KEY (lrowner, lrgroup, lrref)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding library:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_owner(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS owner
(
    oowner character varying(16)  NOT NULL,
    otitle character varying(32) ,
    CONSTRAINT "Owner_pkey" PRIMARY KEY (oowner)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding owner:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_ownergroup(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS ownergroup
(
    ogowner character varying(16)  NOT NULL,
    oggroup character varying(32)  NOT NULL,
    ogtitle character varying(50) ,
    ogcntquestions smallint DEFAULT 0,
    ogcntlibrary smallint DEFAULT 0,
    CONSTRAINT ownergroup_pkey PRIMARY KEY (ogowner, oggroup)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding ownergroup:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_questions(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS questions
(
    qqid integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 800 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    qowner character varying(16)  NOT NULL,
    qdetail character varying(256) ,
    qgroup character varying(32)  NOT NULL,
    qpoints integer[],
    qans text[] ,
    qseq smallint NOT NULL,
    CONSTRAINT questions_pkey PRIMARY KEY (qowner, qgroup, qseq)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding questions:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_reftype(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS reftype
(
    rttype character varying  NOT NULL,
    rttitle character varying(32) ,
    CONSTRAINT reftype_pkey PRIMARY KEY (rttype)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding reftype:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_sessions(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS sessions
(
    v_vid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    v_datetime timestamp with time zone NOT NULL
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding sessions:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_users(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS users
(
    u_uid integer NOT NULL,
    u_name character varying(100) ,
    u_email text  NOT NULL,
    u_joined timestamp without time zone NOT NULL,
    u_fedid character varying(30) ,
    u_admin boolean,
    u_fedcountry character varying(16) ,
    CONSTRAINT users_pkey PRIMARY KEY (u_uid)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding users:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_usershistory(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS usershistory
(
    r_hid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 600 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    r_datetime timestamp with time zone NOT NULL,
    r_owner character varying(16)  NOT NULL,
    r_group character varying(32) ,
    r_questions integer,
    r_qid integer[],
    r_ans integer[],
    r_uid integer,
    r_points integer[],
    r_maxpoints integer,
    r_totalpoints integer,
    r_correctpercent integer
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding usershistory:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_usersowner(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS usersowner
(
    uouid integer NOT NULL,
    uouser character varying(32) ,
    uoowner character varying(32)  NOT NULL,
    CONSTRAINT usersowner_pkey PRIMARY KEY (uouid, uoowner)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding usersowner:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_userspwd(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS userspwd
(
    upuid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 50 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    uphash character varying(100)  NOT NULL,
    upuser character varying(32) ,
    CONSTRAINT login_pkey PRIMARY KEY (upuid)
)

`

    return create_Table
  } catch (error) {
    console.error('Error seeding userspwd:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_userspwd_idx(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
CREATE UNIQUE INDEX IF NOT EXISTS userspwd_user
    ON userspwd USING btree
    (upuser  ASC NULLS LAST)

`

    return create_Table
  } catch (error) {
    console.error('Error seeding userspwd_user:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_userssessions(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS userssessions
(
    usid integer NOT NULL GENERATED BY DEFAULT AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    usdatetime timestamp with time zone NOT NULL,
    usuid integer NOT NULL
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding userssessions:', error)
    throw error
  }
}
/* --------------------------------------------------------------------*/
async function create_who(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

    const create_Table = await client.sql`
  CREATE TABLE IF NOT EXISTS who
(
    wwho character varying(16)  NOT NULL,
    wtitle character varying(32) ,
    CONSTRAINT "Who_pkey" PRIMARY KEY (wwho)
)
`

    return create_Table
  } catch (error) {
    console.error('Error seeding who:', error)
    throw error
  }
}
