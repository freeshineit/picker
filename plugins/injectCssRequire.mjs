/**
 * 插入css文件
 * @returns
 */
export function injectCssRequire() {
  return {
    name: "inject-css-require",
    generateBundle(options, bundle) {
      Object.values(bundle).forEach((chunk) => {
        if (chunk.type === "chunk") {
          // 在文件头部插入
          // chunk.code = 'require("./css.css");\n' + chunk.code;
          // 在文件尾部插入
          chunk.code = chunk.code + 'require("./css.css");\n';
        }
      });
    },
  };
}
