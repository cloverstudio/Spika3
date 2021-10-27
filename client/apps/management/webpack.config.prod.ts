import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

import baseWebConfig from "./webpack.config";

baseWebConfig.output!.publicPath = "/management";

export default baseWebConfig;
