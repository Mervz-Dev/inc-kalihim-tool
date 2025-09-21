export declare namespace User {
  type Gender = "male" | "female";

  interface UserFormData {
    fullname: string;
    purok: string;
    grupo: string;
    gender: Gender;
  }

  interface ServerUser extends UserFormData {
    id: number;
    createdAt: string;
    firstSession: number;
    secondSession: number;
  }

  interface User extends UserFormData {
    id: number;
    createdAt: string;
    firstSession: boolean;
    secondSession: boolean;
  }

  interface PurokCount {
    purok: string;
    grupoCount: number;
    userCount: number;
    maleCount: number;
    femaleCount: number;
  }

  interface PurokGrupoStat {
    purok: string;
    grupo: string;
    userCount: number;
  }

  type Session = "first" | "second";

  interface SessionData {
    purok: string;
    grupo: string;
    firstSession: {
      maleUsers: User.User[];
      femaleUsers: User.User[];
    };
    secondSession: {
      maleUsers: User.User[];
      femaleUsers: User.User[];
    };
  }

  interface AttendanceData {
    purok: string;
    grupo: string;
    maleUsers: User.User[];
    femaleUsers: User.User[];
  }

  interface SessionAttendanceHealth {
    totalMarkedSessions: number;
    userTotalSessions: number;
  }
}
