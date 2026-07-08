import { defineThemeConfig } from 'vuepress-theme-plume'
import navbar from './navbar.js'
import collections from './collections.js'

export default defineThemeConfig({
  logo: '/avatar.png',
  appearance: true,

  profile: {
    name: 'Ca2didi',
    description: '专注于游戏开发领域的小众民工',
    avatar: '/avatar.png',
    circle: true,
  },

  social: [
    { icon: 'github', link: 'https://github.com/Cardidi' },
    { icon: 'twitter', link: 'https://x.com/Ca2didi' },
  ],

  navbar,
  collections,

  footer: {
    message: 'Use <a href="https://v2.vuepress.vuejs.org/" target="_blank">VuePress</a> & <a href="https://theme-plume.vuejs.press" target="_blank">Plume</a> to Orgnize Bytes.',
    copyright: "Cardidi © 2026, All Right Reserved."
  },

  blog: {
    link: '/',
    include: ['posts/**/*.md'],
    article: '/posts/',
  },

  plugins: {
    search: {},
    markdownPower: {
      pdf: true,
      bilibili: true,
      youtube: true,
      icons: true,
      codepen: true,
      jsfiddle: true,
      codesandbox: true,
      replit: true,
    },
    markdownImage: {},
    markdownMath: {},
    readingTime: {},
    watermark: { enabled: false },
    autoFrontmatter: {
      permalink: 'filepath'
    },
    changelog: {},
    contributors: {},
    copyright: true,
    sitemap: {
      hostname: 'https://ca2didi.xyz',
    },
  },
})
