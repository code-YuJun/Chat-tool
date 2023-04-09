const path = require("path");
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "chat.min.js",
    path: path.resolve(__dirname, "./dist"), // 出口必须是绝对路径
    clean: true,
  },
  module: {
    rules: [
      {
        // 规则使用正则表达式
        test: /\.css$/, // 匹配资源
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [],
};
