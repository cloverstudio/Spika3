import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

import baseWebConfig from "./webpack.config";

baseWebConfig.output!.publicPath = "/messenger";
export default baseWebConfig;
