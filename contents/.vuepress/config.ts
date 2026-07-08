import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'CA2DSite',
  description: 'Preserved Space for Ca2didi',
  base: '/',
  theme: plumeTheme({
    hostname: 'https://ca2didi.xyz',
  }),
  bundler: viteBundler(),
})
