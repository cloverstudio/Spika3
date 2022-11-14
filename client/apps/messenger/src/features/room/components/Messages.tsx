import React from "react";

import DeleteMessageDialog from "./message/DeleteMessageDialog";
import MessageDetailDialog from "./message/MessageDetailsModal";
import MessagesList from "./message/MessagesList";

export default function Messages(): React.ReactElement {
    return (
        <>
            <MessagesList />
            <MessageDetailDialog />
            <DeleteMessageDialog />
        </>
    );
}
