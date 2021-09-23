import { PrismaClient, UserAccount } from "@prisma/client";
const prisma = new PrismaClient();

export interface Globals {
  adminToken: string;
  createdUser: UserAccount | undefined;
}

const globals: Globals = {
  adminToken: "",
  createdUser: undefined,
};

export default globals;
