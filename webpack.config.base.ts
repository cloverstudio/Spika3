import path from "path";
import {
  Configuration,
  HotModuleReplacementPlugin,
  DefinePlugin,
} from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const config: Configuration = {
  mode: "development",
  entry: "./client/apps/management/index.tsx",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "../../../public/management"),
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
            loader: "url-loader",
            options: {
              limit: 25000,
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
              name: "[name].[contenthash].[ext]",
              esModule: false, // <- here
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
      filename: "[name].[hash].css",
      chunkFilename: "[id].css",
    }),
    new DefinePlugin({
      API_BASEURL: JSON.stringify(process.env.API_BASEURL),
    }),
  ],
};

export default config;
