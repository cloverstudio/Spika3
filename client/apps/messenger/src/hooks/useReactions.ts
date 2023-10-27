import { useAppSelector } from ".";
import { useCreateReactionMutation, useRemoveReactionMutation } from "../features/room/api/message";
import { selectUser } from "../store/userSlice";
import { MessageRecordType } from "../types/Message";

function useReactions() {
    const [createReaction] = useCreateReactionMutation();
    const [removeReaction] = useRemoveReactionMutation();
    const user = useAppSelector(selectUser);

    const addReaction = async (messageId: number, reaction: string) => {
        await createReaction({ messageId, reaction });
    };

    const removeUserReaction = async (reactions: MessageRecordType[]) => {
        const userReaction = reactions.find((r) => r.userId === user.id);

        if (userReaction) {
            await removeReaction({ messageRecordId: userReaction.id });
        }
    };

    const toggleReaction = async (
        messageId: number,
        reaction: string,
        reactions: MessageRecordType[],
    ) => {
        const userReaction = reactions.find((r) => r.userId === user.id);

        if (userReaction && userReaction.reaction === reaction) {
            await removeUserReaction(reactions);
        } else {
            await addReaction(messageId, reaction);
        }
    };

    return {
        addReaction,
        removeUserReaction,
        toggleReaction,
    };
}

export default useReactions;
