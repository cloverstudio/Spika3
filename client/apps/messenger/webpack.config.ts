import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { DefinePlugin } from "webpack";
import baseWebConfig from "../../../webpack.config.base";

baseWebConfig.entry = "./client/apps/messenger/src/index.tsx";
baseWebConfig.output!.path = path.resolve(__dirname, "../../../public/messenger");
baseWebConfig.plugins!.push(
    new HtmlWebpackPlugin({ template: "./client/apps/messenger/src/index.html" })
);
baseWebConfig.plugins.push(
    new DefinePlugin({
        BASE_URL: JSON.stringify("/"),
    })
);

export default baseWebConfig;
