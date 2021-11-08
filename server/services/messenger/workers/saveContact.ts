import { PrismaClient } from "@prisma/client";

import QueueWorkerInterface from "../../types/queueWokerInterface";
import { CreateContactPayload } from "../../types/queuePayloadTypes";
import l from "../../../components/logger";

const prisma = new PrismaClient();

class saveContactWorker implements QueueWorkerInterface {
  async run(payload: CreateContactPayload) {
    const { contactId, userId } = payload;

    const existingContact = await prisma.contact.findFirst({
      where: { contactId, userId },
      select: { contactId: true },
    });

    if (!existingContact) {
      await prisma.contact.create({ data: { contactId, userId } });
    }

    l(
      "Create contact worker payload: ",
      payload,
      "New contact created: ",
      !existingContact
    );
  }
}

export default new saveContactWorker();
