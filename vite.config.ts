import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";


// function to generate manifest file  
function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  if (mode === 'firefox') {
    return {
      plugins: [
        react(),
        webExtension({
          manifest: generateManifest,
          browser: 'firefox',
        }),
      ],
      build: {
        outDir: 'dist/firefox'
      }
    }
  }
  else {
    return {
      plugins: [
        react(),
        webExtension({
          manifest: generateManifest,
          browser: 'chrome',
        }),
      ],
      build: {
        outDir: 'dist/chrome'
      }
    }
  }
});
