import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import path from 'path';

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        name: 'Radish Chrome Boilerplate',
        description: 'Radish Chrome Boilerplate',
        version: '1.0.0',
        default_locale: 'en',
        permissions: ["activeTab", "scripting", "storage", "tabs", "sidePanel"],
        host_permissions: ["<all_urls>"],
        action: {
            default_title: "Radish Chrome Boilerplate",
            default_icon: {
                "16": "icon/16.png",
                "32": "icon/32.png",
                "48": "icon/48.png",
                "128": "icon/128.png"
            }
        },
        icons: {
            "16": "icon/16.png",
            "32": "icon/32.png",
            "48": "icon/48.png",
            "128": "icon/128.png"
        },
        web_accessible_resources: [{
            resources: ["google-auth.html", "google-auth/*"],
            matches: ["<all_urls>"]
        }]
    },
    vite: () => ({
        plugins: [react()],
        envPrefix: ['VITE_', 'WXT_'],
        resolve: {
            alias: {
                '@': path.resolve(__dirname)
            }
        }
    }),
    entrypointsDir: './entrypoints'
});
