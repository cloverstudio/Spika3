import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { DefinePlugin } from "webpack";
import baseWebConfig from "../../../webpack.config.base";

baseWebConfig.entry = "./client/apps/template/src/index.tsx";
baseWebConfig.output!.path = path.resolve(__dirname, "../../../public/template");
baseWebConfig.plugins!.push(
    new HtmlWebpackPlugin({ template: "./client/apps/template/src/index.html" })
);

baseWebConfig.output!.publicPath = "/template";
baseWebConfig.plugins!.push(
    new DefinePlugin({
        BASE_URL: JSON.stringify("/template"),
    })
);

export default baseWebConfig;
