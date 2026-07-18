import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { downloadGridTemplate } from "./src/download-grid";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubActionsBase = repositoryName ? `/${repositoryName}/` : "/";
const base = process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? githubActionsBase : "/");
const axiBackendProxyPath = "/__axi_backend";
const downloadGridPlaceholder = "<!-- AXICHAT_DOWNLOAD_GRID -->";

export default defineConfig({
  base,
  plugins: [
    {
      name: "axichat-download-grid",
      transformIndexHtml: {
        order: "pre",
        handler(html) {
          return html.replace(downloadGridPlaceholder, downloadGridTemplate.trim());
        },
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, "index.html"),
        notFound: resolve(projectRoot, "404.html"),
        register: resolve(projectRoot, "register/index.html"),
      },
    },
  },
  server: {
    proxy: {
      [axiBackendProxyPath]: {
        target: "https://axi.im",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(new RegExp(`^${axiBackendProxyPath}`), ""),
      },
    },
  },
});
