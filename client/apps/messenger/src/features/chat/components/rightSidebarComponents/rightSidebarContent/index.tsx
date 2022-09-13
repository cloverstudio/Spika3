import React from "react";
import { useSelector } from "react-redux";

import { selectUser } from "../../../../../store/userSlice";
import { RoomType } from "../../../../../types/Rooms";
import { selectRightSidebarActiveTab } from "../../../slice/rightSidebarSlice";
import { DetailsAdditionalInfoView } from "../AdditionalInfoView";
import { DetailsBasicInfoView } from "../BasicInfoView";
import { DetailsDestructiveActionsView } from "../DestructiveActionsView";
import { DetailsMemberView } from "../MembersView";

import RightSidebarCreateNoteContent from "./RightSidebarCreateNoteContent";
import RightSidebarEditNoteContent from "./RightSidebarEditNoteContent";
import RightSidebarNoteDetailContent from "./RightSidebarNoteDetailContent";
import RightSidebarNotesContent from "./RightSidebarNotesContent";

type RightSidebarContentProps = {
    room: RoomType;
};

export default function RightSidebarContent({
    room,
}: RightSidebarContentProps): React.ReactElement {
    const user = useSelector(selectUser);
    const activeTab = useSelector(selectRightSidebarActiveTab);

    const otherUser = room.users.find((u) => u.userId !== user.id);
    const isPrivate = room.type === "private";

    if (activeTab === "details") {
        return (
            <>
                <DetailsBasicInfoView roomData={room} />
                <DetailsAdditionalInfoView roomData={room} />
                {!isPrivate ? <DetailsMemberView members={room.users} roomId={room.id} /> : null}
                <DetailsDestructiveActionsView isItPrivateChat={isPrivate} otherUser={otherUser} />
            </>
        );
    }

    if (activeTab === "notes") {
        return <RightSidebarNotesContent />;
    }

    if (activeTab === "createNote") {
        return <RightSidebarCreateNoteContent />;
    }

    if (activeTab === "noteDetail") {
        return <RightSidebarNoteDetailContent />;
    }

    if (activeTab === "editNote") {
        return <RightSidebarEditNoteContent />;
    }
}
