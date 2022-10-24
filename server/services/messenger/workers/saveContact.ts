import QueueWorkerInterface from "../../types/queueWorkerInterface";
import { CreateContactPayload } from "../../types/queuePayloadTypes";
import { error as le } from "../../../components/logger";
import prisma from "../../../components/prisma";

class saveContactWorker implements QueueWorkerInterface {
    async run(payload: CreateContactPayload) {
        try {
            const { contactId, userId } = payload;

            const existingContact = await prisma.contact.findFirst({
                where: { contactId, userId },
                select: { contactId: true },
            });

            if (!existingContact) {
                await prisma.contact.create({ data: { contactId, userId } });
            }
        } catch (error) {
            le("Create contact worker failed: ", error);
        }
    }
}

export default new saveContactWorker();
