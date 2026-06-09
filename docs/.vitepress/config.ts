import { defineConfig } from "vitepress";

export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  description: "Niumer CLI usage and feature guide.",
  lang: "zh-CN",
  lastUpdated: true,
  title: "Niumer CLI",
  themeConfig: {
    nav: [
      { link: "/", text: "首页" },
      { link: "/guide/count", text: "count 命令" }
    ],
    sidebar: [
      {
        items: [
          { link: "/", text: "介绍" },
          { link: "/guide/count", text: "niumer count" }
        ],
        text: "指南"
      }
    ]
  }
});
