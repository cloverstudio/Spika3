import React from "react";

import AddedAdminsSystemMessage from "./AddedAdmins";
import RemovedMembersSystemMessage from "./RemovedMembers";
import UpdateGroupSystemMessage from "./UpdatedGroup";
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
    SYSTEM_MESSAGE_TYPE_UPDATE_GROUP,
    SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_NAME,
    SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_AVATAR,
    SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_ADMINS,
    SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_MEMBERS,
    SYSTEM_MESSAGE_TYPE_ADD_GROUP_MEMBERS,
    SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_MEMBERS,
    SYSTEM_MESSAGE_TYPE_ADD_GROUP_ADMINS,
    SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_ADMINS,
    SYSTEM_MESSAGE_TYPE_CREATE_NOTE,
    SYSTEM_MESSAGE_TYPE_UPDATE_NOTE,
    SYSTEM_MESSAGE_TYPE_DELETE_NOTE,
} from "../../../../lib/consts";

export default function SystemMessage({
    body,
    createdAt,
}: {
    body: any;
    createdAt: number;
}): React.ReactElement {
    switch (body.type) {
        case SYSTEM_MESSAGE_TYPE_CREATE_GROUP:
            return <CreatedGroupSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_GROUP:
            return <UpdateGroupSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_NAME:
            return <UpdateGroupNameSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_AVATAR:
            return <UpdateGroupAvatarSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_ADMINS:
            return <AddedAdminsSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_GROUP_MEMBERS:
            return <RemovedMembersSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_ADD_GROUP_MEMBERS:
            return <AddedMembersSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_MEMBERS:
            return <RemovedMembersSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_ADD_GROUP_ADMINS:
            return <AddedAdminsSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_REMOVE_GROUP_ADMINS:
            return <RemovedAdminsSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_CREATE_NOTE:
            return <CreatedNoteSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_UPDATE_NOTE:
            return <UpdateNoteSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_DELETE_NOTE:
            return <DeletedNoteSystemMessage body={body} createdAt={createdAt} />;
        case SYSTEM_MESSAGE_TYPE_USER_LEAVE_GROUP:
            return <LeaveRoomSystemMessage body={body} createdAt={createdAt} />;
        default:
            return <div>{body.text}</div>;
    }
}
