import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

import baseWebConfig from "../../../webpack.config.base";

baseWebConfig.entry = "./client/apps/messenger/src/index.tsx";
baseWebConfig.output!.path = path.resolve(__dirname, "../../../public/messenger");
baseWebConfig.plugins!.push(
    new HtmlWebpackPlugin({ template: "./client/apps/messenger/src/index.html" })
);

export default baseWebConfig;
