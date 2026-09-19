import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { languages } from "./i18n";
import { categoryLabels, seriesLabels, tagLabels } from "./taxonomy";

const langEnum = z.enum(languages.map((l) => l.code) as [string, ...string[]]);

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    /** 最后修改时间(可选):展示规则待定,仅预留字段 */
    updated: z.date().optional(),
    description: z.string(),
    /** 正文摘要(可选):卡片/列表展示用,无 fallback,没有就不显示 */
    excerpt: z.string().optional(),
    /** 标签:仅允许 taxonomy.ts 中定义的英文 key,未命中即构建失败并报错 */
    tags: z
      .array(z.string())
      .default([])
      .superRefine((tags, ctx) => {
        for (const tag of tags) {
          if (!(tag in tagLabels)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `未知 tag "${tag}":仅允许 src/taxonomy.ts 的 tagLabels 中已定义的英文 key;如确需使用,先补入映射表再引用`,
            });
          }
        }
      }),
    lang: langEnum,
    /** 互译关联:另一语言文章的集合 id,如 "zh/hello-world" */
    translationOf: z.string().optional(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    /** 内容大类:key 同 tags 走映射表(tech/journal 起步,可扩展),未命中构建失败 */
    category: z
      .string()
      .default("tech")
      .refine((c) => c in categoryLabels, {
        message:
          "未知 category:仅允许 src/taxonomy.ts 的 categoryLabels 中已定义的 key",
      }),
    /** 专栏 id:小写字母开头,仅含小写字母与数字;标题由 seriesLabels 按语言提供 */
    series: z
      .string()
      .regex(
        /^[a-z][a-z0-9]*$/,
        "series id 必须小写字母开头,仅含小写字母与数字",
      )
      .refine((s) => s in seriesLabels, {
        message:
          "未知 series:请先在 src/taxonomy.ts 的 seriesLabels 中定义该 id 及各语言标题",
      })
      .optional(),
    /** 视频引用:平台 id 至少提供一个 */
    video: z
      .object({
        bilibili: z.string().optional(),
        youtube: z.string().optional(),
      })
      .optional(),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/about" }),
  schema: z.object({
    title: z.string(),
    lang: langEnum,
    /** 站长一句话简介 */
    intro: z.string(),
    /** 技术能力清单 */
    skills: z.array(z.string()).default([]),
    /** 喜好清单 */
    interests: z.array(z.string()).default([]),
    /** 社交账号 */
    socials: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
        }),
      )
      .default([]),
    /** 豆瓣书影音入口 */
    douban: z
      .object({
        label: z.string(),
        url: z.string(),
      })
      .optional(),
  }),
});

export const collections = { blog, about };
