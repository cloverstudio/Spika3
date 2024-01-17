import React from "react";

import AddedAdminsSystemMessage from "./AddedAdmins";
import RemovedMembersSystemMessage from "./RemovedMembers";
import UpdateGroupAvatarSystemMessage from "./UpdatedGroupAvatar";
import UpdateGroupNameSystemMessage from "./UpdatedGroupName";
import AddedMembersSystemMessage from "./AddedMembers";
import RemovedAdminsSystemMessage from "./RemovedAdmins";
import LeaveRoomSystemMessage from "./LeaveRoom";
import UpdateNoteSystemMessage from "./UpdatedNote";
import CreatedNoteSystemMessage from "./CreatedNote";
import DeletedNoteSystemMessage from "./DeletedNote";
import CreatedGroupSystemMessage from "./CreatedGroup";

import {
    SYSTEM_MESSAGE_TYPE_CREATE_GROUP,
    SYSTEM_MESSAGE_TYPE_USER_LEAVE_GROUP,
    SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_NAME,
    SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_AVATAR,
    SYSTEM_MESSAGE_TYPE_ADD_GROUP_MEMBERS,
    SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_MEMBERS,
    SYSTEM_MESSAGE_TYPE_ADD_GROUP_ADMINS,
    SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_ADMINS,
    SYSTEM_MESSAGE_TYPE_CREATE_NOTE,
    SYSTEM_MESSAGE_TYPE_UPDATE_NOTE,
    SYSTEM_MESSAGE_TYPE_DELETE_NOTE,
} from "../../../../lib/consts";

export default function SystemMessage({ body }: { body: any }): React.ReactElement {
    switch (body.type) {
        case SYSTEM_MESSAGE_TYPE_CREATE_GROUP:
            return <CreatedGroupSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_NAME:
            return <UpdateGroupNameSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_AVATAR:
            return <UpdateGroupAvatarSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_ADD_GROUP_MEMBERS:
            return <AddedMembersSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_MEMBERS:
            return <RemovedMembersSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_ADD_GROUP_ADMINS:
            return <AddedAdminsSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_ADMINS:
            return <RemovedAdminsSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_CREATE_NOTE:
            return <CreatedNoteSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_NOTE:
            return <UpdateNoteSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_DELETE_NOTE:
            return <DeletedNoteSystemMessage body={body} />;
        case SYSTEM_MESSAGE_TYPE_USER_LEAVE_GROUP:
            return <LeaveRoomSystemMessage body={body} />;
        default:
            return <div>{body.text}</div>;
    }
}
