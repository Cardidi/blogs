import { defineThemeConfig } from 'vuepress-theme-plume'
import navbar from './navbar.js'
import collections from './collections.js'

export default defineThemeConfig({
  logo: '/avatar.png',
  appearance: true,

  profile: {
    name: 'ca2didi',
    description: '技术与生活',
    avatar: '/avatar.png',
    circle: true,
    location: '',
    organization: '',
  },

  social: [
    { icon: 'github', link: 'https://github.com/Cardidi' },
    { icon: 'x', link: 'https://x.com/Ca2didi' },
  ],

  navbar,
  collections,

  footer: {
    message: 'Powered by <a href="https://v2.vuepress.vuejs.org/" target="_blank">VuePress</a> & <a href="https://theme-plume.vuejs.press" target="_blank">vuepress-theme-plume</a>',
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
    autoFrontmatter: {},
    changelog: {},
    contributors: {},
    copyright: true,
    sitemap: {
      hostname: 'https://ca2didi.xyz',
    },
  },

})
