import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { CreateContactPayload } from "../../types/queuePayloadTypes";
import { error as le } from "../../../components/logger";
import prisma from "../../../components/prisma";
import removeOlderContacts from "../lib/removeOlderContacts";

class saveContactWorker implements QueueWorkerInterface {
    async run(payload: CreateContactPayload) {
        try {
            const { contactId, userId, shouldRunDeleteOldContacts } = payload;

            const existingContact = await prisma.contact.findFirst({
                where: { contactId, userId },
                select: { contactId: true },
            });

            if (!existingContact) {
                await prisma.contact.create({ data: { contactId, userId } });
            } else {
                await prisma.contact.updateMany({
                    where: { contactId, userId },
                    data: { lastConfirmedAt: new Date() },
                });
            }

            if (shouldRunDeleteOldContacts) {
                setTimeout(async () => {
                    await removeOlderContacts(userId);
                }, 10 * 1000);
            }
        } catch (error) {
            le("Create contact worker failed: ", error);
        }
    }
}

export default new saveContactWorker();
