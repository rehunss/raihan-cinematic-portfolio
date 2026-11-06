import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[react(),tailwindcss()],base:process.env.VITE_BASE_PATH || '/raihan-cinematic-portfolio/',server:{host:'127.0.0.1',port:4174,strictPort:true},preview:{host:'127.0.0.1',port:4174,strictPort:true},build:{sourcemap:false}});
