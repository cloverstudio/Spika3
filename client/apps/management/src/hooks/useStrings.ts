import { APP_DEFAULT_LANG } from "@lib/constants";

const en = {
    username: "Username",
    password: "Password",
    enter: "Enter",
    login: "Login",
    welcome: "Welcome",
    loginToContinue: "Login to continue",
};

const strings = {
    en,
};

export default function useStrings() {
    return strings[APP_DEFAULT_LANG];
}
