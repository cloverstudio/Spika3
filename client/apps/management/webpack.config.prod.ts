import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { DefinePlugin } from "webpack";
import baseWebConfig from "../../../webpack.config.base";

baseWebConfig.entry = "./client/apps/management/src/index.tsx";
baseWebConfig.output!.path = path.resolve(__dirname, "../../../public/management");
baseWebConfig.plugins!.push(
    new HtmlWebpackPlugin({ template: "./client/apps/management/src/index.html" })
);

baseWebConfig.output!.publicPath = "/management";
baseWebConfig.plugins.push(
    new DefinePlugin({
        BASE_URL: JSON.stringify("/management"),
    })
);

export default baseWebConfig;
