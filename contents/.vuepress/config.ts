import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import theme from './theme.ts'

export default defineUserConfig({
    lang: 'zh-CN',
    title: 'CA2DSite',
    description: 'Preserved Space for Ca2didi',
    base: '/',
    bundler: viteBundler(),
    theme,
})
