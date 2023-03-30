import { APP_DEFAULT_LANG } from "@lib/constants";

const en = {
    username: "Username",
    password: "Password",
    enter: "Enter",
    login: "Login",
    welcome: "Welcome",
    loginToContinue: "Login to continue",
    genericError: "Something went wrong",
    users: "Users",
    editUser: "Edit user",
    save: "Save",
    cancel: "Cancel",
    displayName: "Display name",
    telephoneNumber: "Telephone number",
    emailAddress: "Email address",
    verified: "Verified",
    verificationCode: "Verification code",
    createdAt: "Created at",
    modifiedAt: "Modified at",
    yes: "Yes",
    no: "No",
    deleteUser: "Delete user",
    deleteUserConfirmation:
        "Are you sure you want to delete this user? Deleting user can take a while.",
    userDeleted: "User deleted",
    userUpdated: "User updated",
    groups: "Groups",
    errorWhileFetchingUsers: "Error while fetching users",
    errorWhileFetchingUser: "Error while fetching user",
    errorWhileFetchingGroups: "Error while fetching groups",
    userRemovedFromGroup: "User removed from group",
    removeUserFromGroup: "Remove user from group",
    removeUserFromGroupConfirmation: "Are you sure you want to remove user from this group?",
    activeDevices: "Active devices",
    expiredDevices: "Logout devices",
    logoutUserFromDevice: "Logout user from device",
    logoutUserFromDeviceConfirmation:
        "Are you sure you want to logout user from device: {deviceName}?",
    userLogoutFromDevice: "User logout from device",
    uploadImageInstructions: "Click on image to change",
    removeImage: "Remove image",
};

const strings = {
    en,
};

export default function useStrings() {
    return strings[APP_DEFAULT_LANG];
}
