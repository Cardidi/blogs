import { defineCollections, PostsCategoryItem } from 'vuepress-theme-plume'

const categoriesMap = new Map<string, string>();

categoriesMap.set("life", "日常随笔");
categoriesMap.set("tech", "技术思考");

export default defineCollections([
    {
      type: 'post',
        dir: 'posts',
        include: ['**/*.md'],
        
        link: '/',
        linkPrefix: '/article/',
        title: '主页',
        pagination: 12,

        categoriesLink: '/categories/',
        categoriesTransform: (items: PostsCategoryItem[]) => {

            for (const item of items) {
                item.id = item.name;
                const realName = categoriesMap.get(item.name);
                if (!!realName) {
                    item.name = realName;
                }
            }

            return items;
        },

        tagsLink: "/tags/",
        archivesLink: "/archives/",

        autoFrontmatter: {
            permalink: 'filepath',
            title: true,
            createTime: true
        }
    },
])