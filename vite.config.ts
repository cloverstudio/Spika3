import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import * as path from "path";

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    const configTemplage = {
        root: "./client/apps/template/",
        base: "/template/",
        publicDir: "../../public/template",
        plugins: [svgr(), react()],
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
        publicDir: "../../../public/shared",
        plugins: [svgr(), react()],
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
        publicDir: "../../../public/shared",
        plugins: [svgr(), react()],
        build: {
            outDir: "../../../public/management",
        },
        define: {
            BASE_URL: JSON.stringify("/management"),
            UPLOADS_BASE_URL: JSON.stringify(env.UPLOADS_BASE_URL),
            API_BASE_URL: JSON.stringify(env.API_BASE_URL),
        },
        server: {
            port: 3002,
            host: "0.0.0.0",
        },
        resolve: {
            alias: [
                { find: "@assets", replacement: path.resolve(__dirname, "./client/assets") },
                { find: "@lib", replacement: path.resolve(__dirname, "./client/lib") },
                { find: "@", replacement: path.resolve(__dirname, "./client/apps/management/src") },
            ],
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
