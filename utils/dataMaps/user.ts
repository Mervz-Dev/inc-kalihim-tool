import { User } from "@/types/user";

export const normaliseUser = (serverUser: User.ServerUser): User.User => {
  return {
    ...serverUser,
    firstSession: !!serverUser.firstSession,
    secondSession: !!serverUser.secondSession,
  };
};
