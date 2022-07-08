import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const configTemplage = {
        root: "./client/apps/template/",
        base: "/template/",
        publicDir: "../../public/template",
        plugins: [react()],
        build: {
            outDir: "../../../public/template",
        },
        define: {
            BASE_URL: JSON.stringify("/template"),
            API_BASE_URL: JSON.stringify(env.API_BASE_URL),
        },
        server: {
            port: 3001,
            host: "0.0.0.0",
        },
    };

    const configMessenger = {
        root: "./client/apps/messenger/",
        base: "/messenger/",
        publicDir: "../../public/messenger",
        plugins: [react()],
        build: {
            outDir: "../../../public/messenger",
        },
        define: {
            ENV: JSON.stringify(env.ENV),
            BASE_URL: JSON.stringify("/messenger"),
            API_BASE_URL: JSON.stringify(env.API_BASE_URL),
            UPLOADS_BASE_URL: JSON.stringify(env.UPLOADS_BASE_URL),
            CONFCALL_HOST_URL: JSON.stringify(env.CONFCALL_HOST_URL),
            FCM_PROJECT_ID: JSON.stringify(env.FCM_PROJECT_ID),
            FCM_API_KEY: JSON.stringify(env.FCM_API_KEY),
            FCM_AUTH_DOMAIN: JSON.stringify(env.FCM_AUTH_DOMAIN),
            FCM_STORAGE_BUCKET: JSON.stringify(env.FCM_STORAGE_BUCKET),
            FCM_SENDER_ID: JSON.stringify(env.FCM_SENDER_ID),
            FCM_APP_ID: JSON.stringify(env.FCM_APP_ID),
            FCM_VAPID_KEY: JSON.stringify(env.FCM_VAPID_KEY),
            TEAM_MODE: JSON.stringify(env.TEAM_MODE),
        },
        server: {
            port: 3001,
            host: "0.0.0.0",
        },
    };

    const configManagement = {
        root: "./client/apps/management/",
        base: "/management/",
        publicDir: "../../public/management",
        plugins: [react()],
        build: {
            outDir: "../../../public/management",
        },
        define: {
            BASE_URL: JSON.stringify("/management"),
            UPLOADS_BASE_URL: JSON.stringify(env.UPLOADS_BASE_URL),
            API_BASE_URL: JSON.stringify(env.API_BASE_URL),
        },
        server: {
            port: 3001,
            host: "0.0.0.0",
        },
    };

    if (mode === "messenger") {
        return configMessenger;
    } else if (mode === "template") {
        console.log("template");
        return configTemplage;
    } else if (mode === "management") {
        return configManagement;
    }
    return configMessenger;
});
