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
    deleteUserConfirmation: "Are you sure you want to delete this user?",
    userDeleted: "User deleted",
    userUpdated: "User updated",
    groups: "Groups",
};

const strings = {
    en,
};

export default function useStrings() {
    return strings[APP_DEFAULT_LANG];
}
