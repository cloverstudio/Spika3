import React from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";

import { RoomType } from "../../../../../types/Rooms";
import { selectRightSidebarActiveTab } from "../../../slices/rightSidebar";
import { DetailsAdditionalInfoView } from "../AdditionalInfoView";
import { DetailsBasicInfoView } from "../BasicInfoView";
import { DetailsDestructiveActionsView } from "../DestructiveActionsView";
import { DetailsMemberView } from "../MembersView";

import RightSidebarCreateNoteContent from "./RightSidebarCreateNoteContent";
import RightSidebarEditNoteContent from "./RightSidebarEditNoteContent";
import RightSidebarSettingsContent from "./RightSidebarSettingsContent";
import RightSidebarNoteDetailContent from "./RightSidebarNoteDetailContent";
import RightSidebarNotesContent from "./RightSidebarNotesContent";

type RightSidebarContentProps = {
    room: RoomType;
};

export default function RightSidebarContentContainer({
    room,
}: RightSidebarContentProps): React.ReactElement {
    return (
        <Box pt={3} px={2.5}>
            <RightSidebarContent room={room} />
        </Box>
    );
}

function RightSidebarContent({ room }: RightSidebarContentProps): React.ReactElement {
    const activeTab = useSelector(selectRightSidebarActiveTab);

    if (activeTab === "details") {
        return (
            <>
                <DetailsBasicInfoView roomData={room} />
                <DetailsAdditionalInfoView roomData={room} />
                {room.type === "group" && (
                    <DetailsMemberView members={room.users} roomId={room.id} />
                )}
                <DetailsDestructiveActionsView room={room} />
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

    if (activeTab === "settings") {
        return <RightSidebarSettingsContent showApiKeySettings={room.type === "group"} />;
    }
}
