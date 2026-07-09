import plumeTheme from "vuepress-theme-plume";
import navbar from './navbar.ts'
import collections from './collections.ts'

export default plumeTheme({
    hostname: 'https://ca2didi.xyz',

    logo: '',
    appearance: true,

    profile: {
        name: 'Ca2didi',
        description: 'S U P E R 加班的游戏民工',
        avatar: '/avatar.jpg',
        location: "大陆北方网友",
        circle: true,
        layout: 'right'
    },

    social: [
        { icon: 'github', link: 'https://github.com/Cardidi' },
        { icon: 'twitter', link: 'https://x.com/Ca2didi' },
    ],

    navbar,
    collections,

    footer: {
        message: 'Use <a href="https://v2.vuepress.vuejs.org/" target="_blank">VuePress</a> & <a href="https://theme-plume.vuejs.press" target="_blank">Plume</a> to Organize Thoughts',
        copyright: "Cardidi © 2026, All Right Reserved."
    },

    search: {
        provider: 'local'
    },

    plugins: {
        sitemap: { hostname: 'https://ca2didi.xyz' },
    },

    markdown: {
      hint: true,
      alert: true,
      fileTree: true,
      plot: true,
      icons: true,
      math: { type: 'katex' },
    }

})