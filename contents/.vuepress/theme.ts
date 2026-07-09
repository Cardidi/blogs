import plumeTheme from "vuepress-theme-plume";
import navbar from './navbar.ts'
import collections from './collections.ts'

export default plumeTheme({
    hostname: 'https://ca2didi.xyz',

    logo: '',
    appearance: true,

    profile: {
        name: 'Ca2didi',
        description: '超级加班的游戏开发民工',
        avatar: '/avatar.jpg',
        location: "北京",
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
        message: 'Use <a href="https://v2.vuepress.vuejs.org/" target="_blank">VuePress</a> & <a href="https://theme-plume.vuejs.press" target="_blank">Plume</a> to Organize Bytes.',
        copyright: "Cardidi © 2026, All Right Reserved."
    },

    search: {
        provider: 'local'
    },

    plugins: {
        markdownPower: {
            pdf: true,
            bilibili: true,
            youtube: true,
            icons: true,
            codepen: true,
            jsfiddle: true,
            codeSandbox: true,
            replit: true,
        },
        watermark: { enabled: false },
        sitemap: { hostname: 'https://ca2didi.xyz' },
    }

})