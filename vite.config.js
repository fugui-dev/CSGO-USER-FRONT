import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { VantResolver } from "@vant/auto-import-resolver";
import { resolve } from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [VantResolver()],
    }),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), // 在src文件下的相对路径都可以写成 @ 符号
    },
  },
  build: {
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    manifest: true,
    // 使用 esbuild 压缩（默认，更快，无需额外依赖）
    minify: 'esbuild',
    // 启用 chunk 大小警告限制
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "0.0.0.0", // 允许外部访问
    open: true, // 自动打开浏览器
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer-when-downgrade"
    },
    proxy: {
		  '/prod-api': {
            // target: 'http://8.136.42.105:80', //目标源，目标服务器，真实请求地址
        target: 'http://121.229.204.223:8090/',
        changeOrigin: true //支持跨域
        // ws: false,        //如果要代理 websockets，配置这个参数
        // secure: false,// 如果是https接口，需要配置这个参数
      },
      // WebSocket 代理配置
      '/ws': {
        // target: 'http://8.136.42.105:80',
        target: 'http://121.229.204.223:8090/',
        changeOrigin: true,
        ws: true, // 启用 WebSocket 代理
        secure: false
      }
		}
  },
});
