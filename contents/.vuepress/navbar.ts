import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
    { text: '关于我', link: '/about/' },
    { text: '分类 ', link: '/categories/' },
    { text: '标签', link: '/tags/' },
    { text: '归档', link: '/archives/' },
    { text: '友链', link: '/friends/' },
])
