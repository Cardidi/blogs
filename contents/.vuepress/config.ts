import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'ca2didi',
  description: '个人博客 - 技术与生活',
  base: '/',
  theme: plumeTheme({
    hostname: 'https://ca2didi.xyz',
  }),
  bundler: viteBundler(),
})
