import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { languages } from "./i18n";
import { categoryLabels, seriesLabels, tagLabels } from "./taxonomy";
import { normalizeDateField, parseDateField } from "./lib/time";

const langEnum = z.enum(languages.map((l) => l.code) as [string, ...string[]]);

/** 日期字段:无时区字符串按默认时区(东八区)解析;YAML 纯日期字面量(已是 UTC 午夜 Date)重解释为当日 00:00。见 lib/time.ts */
const dateWithTz = z.preprocess(
  (v) => {
    if (typeof v === "string") return parseDateField(v);
    if (v instanceof Date) return normalizeDateField(v);
    return v;
  },
  z.date(),
);

const posts = defineCollection({
  loader: glob({
    pattern: ["**/[^_]*.md", "!bak/**"],
    base: "./src/content/posts",
  }),
  schema: z.object({
    title: z.string(),
    pubDate: dateWithTz,
    /** 最后修改时间(可选):展示规则待定,仅预留字段 */
    updated: dateWithTz.optional(),
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
    /** 内容大类:key 同 tags 走映射表(programmer 起步,可扩展),未命中构建失败 */
    category: z
      .string()
      .default("programmer")
      .refine((c) => c in categoryLabels, {
        message:
          "未知 category:仅允许 src/taxonomy.ts 的 categoryLabels 中已定义的 key",
      }),
    /** 专栏 id:kebab-case 小写英文(小写字母开头,可含连字符分隔;禁止首尾与连续连字符);标题由 seriesLabels 按语言提供 */
    series: z
      .string()
      .regex(
        /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
        "series id 必须小写字母开头,仅含小写字母/数字/单连字符,禁止首尾或连续连字符",
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
    /** 题图(与文章同结构):16:9 横幅,纸片最顶部顶格 */
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    /** 站长一句话简介 */
    intro: z.string(),
    /** 基本信息(非隐私:出生年份/所在地/职业等),展示在简介下方 */
    facts: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .default([]),
    /** 技术能力清单(带熟练度 1-10,页面按数值降序渲染) */
    skills: z
      .array(
        z.object({
          name: z.string(),
          level: z.number().min(1).max(10),
        })
      )
      .default([]),
    /** 喜好清单(带喜好程度 1-10,页面按数值降序渲染) */
    interests: z
      .array(
        z.object({
          name: z.string(),
          level: z.number().min(1).max(10),
        })
      )
      .default([]),
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
    /** 经历时间线(倒序:最新在前;职业+教育经历) */
    timeline: z
      .array(
        z.object({
          /** 时间区间,如 "2024 — 至今" */
          period: z.string(),
          /** 角色/事件,如 "全栈工程师" */
          title: z.string(),
          /** 机构/公司/学校 */
          org: z.string().optional(),
          /** 一句话描述 */
          desc: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { posts, about };
