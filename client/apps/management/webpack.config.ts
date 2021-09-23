import path from "path";

import baseWebConfig from "../../../webpack.config.base";

baseWebConfig.entry = "./client/apps/management/index.tsx";
baseWebConfig.output!.path = path.resolve(
  __dirname,
  "../../../public/management"
);

export default baseWebConfig;
