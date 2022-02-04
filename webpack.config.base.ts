import path from "path";
import { Configuration, HotModuleReplacementPlugin, DefinePlugin } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const config: Configuration = {
    mode: "development",
    entry: "./client/apps/management/index.tsx",
    output: {
        filename: "main.js",
        publicPath: "/",
    },
    // webpack 5 comes with devServer which loads in development mode
    devServer: {
        port: 3001,
        historyApiFallback: true,
    },
    // Rules of how webpack will take our files, complie & bundle them for the browser
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.management.json",
                        },
                    },
                ],
            },
            {
                test: /\.scss|\.css$/,
                use: [
                    // fallback to style-loader in development
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.(jpg|png)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[path][name].[ext]",
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: "url-loader?limit=100000",
                        options: {
                            name: "[name].[ext]",
                            esModule: false,
                        },
                    },
                ],
            },
            {
                test: /\.ico$/,
                loader: "file-loader",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
        new DefinePlugin({
            API_BASE_URL: JSON.stringify(process.env.API_BASE_URL),
            ENV: JSON.stringify(process.env.ENV),
            FCM_PROJECT_ID: JSON.stringify(process.env.FCM_PROJECT_ID),
            FCM_API_KEY: JSON.stringify(process.env.FCM_API_KEY),
            FCM_AUTH_DOMAIN: JSON.stringify(process.env.FCM_AUTH_DOMAIN),
            FCM_STORAGE_BUCKET: JSON.stringify(process.env.FCM_STORAGE_BUCKET),
            FCM_SENDER_ID: JSON.stringify(process.env.FCM_SENDER_ID),
            FCM_APP_ID: JSON.stringify(process.env.FCM_APP_ID),
            FCM_VAPID_KEY: JSON.stringify(process.env.FCM_VAPID_KEY),
        }),
    ],
};

export default config;
