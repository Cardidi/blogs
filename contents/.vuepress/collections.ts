import { defineCollections } from 'vuepress-theme-plume'

export default defineCollections([
  {
    type: 'post',
    dir: 'posts',
    link: '/blog/',
    title: '博客',
  },
])
