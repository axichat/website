import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubActionsBase = repositoryName ? `/${repositoryName}/` : "/";
const base = process.env.VITE_BASE_PATH ?? (process.env.GITHUB_ACTIONS ? githubActionsBase : "/");
const axiBackendProxyPath = "/__axi_backend";

export default defineConfig({
  plugins: [react()],
  base,
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
