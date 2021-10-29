import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

export interface Globals {
  adminToken: string;
  createdUser: User | undefined;
  deviceId: string | undefined;
  telephoneNumber: string | undefined;
  userToken: string | undefined;
}

const globals: Globals = {
  adminToken: "",
  createdUser: undefined,
  telephoneNumber: undefined,
  deviceId: undefined,
  userToken: ""
};

export default globals;
