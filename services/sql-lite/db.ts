import { SQLiteDatabase } from "expo-sqlite";

import { TABLE_USER } from "@/constants/database";
import { User } from "@/types/user";
import { normaliseUser } from "@/utils/dataMaps/user";

export const initializeDB = async (db: SQLiteDatabase) => {
  // await db.execAsync(`
  // DROP TABLE IF EXISTS ${TABLE_USER};
  // `);
  await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS ${TABLE_USER} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT NOT NULL,
        gender TEXT NOT NULL,
        purok TEXT NOT NULL,
        grupo TEXT NOT NULL,
        firstSession INTEGER NOT NULL DEFAULT 0,
        secondSession INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `);
};

export const addNewUser = async (
  params: User.UserFormData,
  db: SQLiteDatabase
) => {
  await db.runAsync(`
        INSERT INTO ${TABLE_USER} (fullname, purok, grupo, gender) 
        VALUES ('${params.fullname}', '${params.purok}', '${params.grupo}', '${params.gender}');
    `);
};

export const getAllUsers = async (db: SQLiteDatabase): Promise<User.User[]> => {
  const data = await db.getAllAsync<User.ServerUser>(
    `SELECT * FROM ${TABLE_USER}`
  );

  return data.map((value) => normaliseUser(value));
};

export const getPurokList = async (
  db: SQLiteDatabase
): Promise<User.PurokCount[]> => {
  const data = await db.getAllAsync<User.PurokCount>(`
  SELECT
    purok,
    COUNT(*) as userCount,
    COUNT(DISTINCT grupo) as grupoCount,
    SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as maleCount,
    SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as femaleCount
  FROM ${TABLE_USER}
  GROUP BY purok
`);

  return data;
};

export const getGrupoByPurok = async (
  purok: string,
  gender: User.Gender,
  db: SQLiteDatabase
): Promise<User.PurokGrupoStat[]> => {
  const data = await db.getAllAsync<User.PurokGrupoStat>(`
    SELECT 
    purok,
    grupo, 
    COUNT(*) as userCount FROM ${TABLE_USER} WHERE purok = '${purok}' AND gender = '${gender}' GROUP BY grupo
    ORDER BY CAST(grupo AS INTEGER) ASC;
`);

  return data;
};

export const getUsersByPurokGrupo = async (
  params: Pick<User.User, "purok" | "grupo" | "gender">,
  db: SQLiteDatabase
) => {
  const data = await db.getAllAsync<User.ServerUser>(`
  SELECT * FROM ${TABLE_USER}
  WHERE purok = '${params.purok}' 
    AND grupo = '${params.grupo}' 
    AND gender = '${params.gender}'
  ORDER BY createdAt ASC
`);
  return data.map((value) => normaliseUser(value));
};

export const updateSessionMark = async (
  id: number,
  session: User.Session,
  db: SQLiteDatabase
) => {
  await db.runAsync(
    `UPDATE ${TABLE_USER}
   SET ${session === "first" ? "firstSession" : "secondSession"} = CASE ${
      session === "first" ? "firstSession" : "secondSession"
    } WHEN 0 THEN 1 ELSE 0 END
   WHERE id = ${id}`
  );
};

export const resetSessions = async (purok: string, db: SQLiteDatabase) => {
  await db.runAsync(`
    UPDATE ${TABLE_USER}
    SET firstSession = 0,
        secondSession = 0
    WHERE purok = '${purok}'
    `);
};

export const updateUserById = async (
  id: number,
  updates: User.UserFormData,
  db: SQLiteDatabase
) => {
  await db.runAsync(
    `UPDATE ${TABLE_USER}
     SET fullname = ?, gender = ?, purok = ?, grupo = ?
     WHERE id = ?`,
    [updates.fullname, updates.gender, updates.purok, updates.grupo, id]
  );
};

export const deleteUserById = async (id: number, db: SQLiteDatabase) => {
  await db.runAsync(`DELETE FROM ${TABLE_USER} WHERE id = ?`, [id]);
};

export const getSessionAbsentees = async (
  purok: string,
  db: SQLiteDatabase
) => {
  const rows = await db.getAllAsync<User.ServerUser>(
    `
  SELECT * 
  FROM ${TABLE_USER}
  WHERE purok = ? 
  ORDER BY grupo ASC, gender ASC, createdAt ASC
`,
    [purok]
  );

  const grouped = Object.values(
    rows.reduce((acc, row) => {
      const key = row.grupo;
      if (!acc[key]) {
        acc[key] = {
          grupo: row.grupo,
          purok: row.purok,
          firstSession: {
            maleUsers: [] as User.User[],
            femaleUsers: [] as User.User[],
          },
          secondSession: {
            maleUsers: [] as User.User[],
            femaleUsers: [] as User.User[],
          },
        };
      }

      const normalised = normaliseUser(row);

      if (row.gender === "male") {
        if (row.firstSession) {
          acc[key].firstSession.maleUsers.push(normalised);
        }

        if (row.secondSession) {
          acc[key].secondSession.maleUsers.push(normalised);
        }
      } else if (row.gender === "female") {
        if (row.firstSession) {
          acc[key].firstSession.femaleUsers.push(normalised);
        }

        if (row.secondSession) {
          acc[key].secondSession.femaleUsers.push(normalised);
        }
      }

      return acc;
    }, {} as Record<string, User.SessionData>)
  );

  return grouped;
};

export const getUserAttendance = async (purok: string, db: SQLiteDatabase) => {
  const rows = await db.getAllAsync<User.ServerUser>(
    `
  SELECT * 
  FROM ${TABLE_USER}
  WHERE purok = ? 
  ORDER BY grupo ASC, gender ASC, createdAt ASC
`,
    [purok]
  );

  const grouped = Object.values(
    rows.reduce((acc, row) => {
      const key = row.grupo;
      if (!acc[key]) {
        acc[key] = {
          grupo: row.grupo,
          purok: row.purok,
          maleUsers: [] as User.User[],
          femaleUsers: [] as User.User[],
        };
      }

      const normalised = normaliseUser(row);

      if (row.gender === "male") {
        acc[key].maleUsers.push(normalised);
      } else if (row.gender === "female") {
        acc[key].femaleUsers.push(normalised);
      }

      return acc;
    }, {} as Record<string, User.AttendanceData>)
  );

  return grouped;
};

export const searchUsersByName = async (name: string, db: SQLiteDatabase) => {
  const query = `
    SELECT * FROM ${TABLE_USER}
    WHERE fullname LIKE ? 
    ORDER BY fullname ASC
  `;

  // Add wildcards (%) to search partial matches
  const results = await db.getAllAsync(query, [`%${name}%`]);
  return results;
};

export const getUserAndSessionCounts = async (
  db: SQLiteDatabase
): Promise<User.SessionAttendanceHealth | null> => {
  const query = `
    SELECT 
      COUNT(*) * 2 as userTotalSessions,
      SUM(firstSession + secondSession) as totalMarkedSessions
    FROM ${TABLE_USER};
  `;

  const result = await db.getFirstAsync<User.SessionAttendanceHealth>(query);
  return result;
};
