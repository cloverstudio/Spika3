import path from "path";

import baseWebConfig from "../../../webpack.config.base";

baseWebConfig.entry = "./client/apps/messenger/index.tsx";
baseWebConfig.output!.path = path.resolve(
  __dirname,
  "../../../public/messenger"
);

export default baseWebConfig;
