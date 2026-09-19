/**
 * 站点时间语义:frontmatter 日期无时区时默认按东八区解析(可配置)。
 * 解析与显示统一使用 DEFAULT_TIME_ZONE,保证纯日期文章的时间语义一致。
 *
 * 配置:改 DEFAULT_TIME_ZONE / DEFAULT_TZ_OFFSET_MIN 两处即可切换默认时区。
 */

/** 默认时区 IANA 名(用于 Intl 日期显示) */
export const DEFAULT_TIME_ZONE = "Asia/Shanghai";
/** 默认时区相对 UTC 的偏移(分钟):东八区 = 480 */
export const DEFAULT_TZ_OFFSET_MIN = 8 * 60;

/**
 * 解析 frontmatter 日期字符串为 Date(内部时刻 = 该时区的真实时刻):
 * - 已带时区偏移(如 2026-10-03T02:22:36+08:00 / ...Z)→ new Date 直接解析
 * - 无时区(如 2026-09-14 / 2026-09-14T02:22:36)→ 按默认时区(东八区)解析,
 *   "2026-09-14" 即东八区 2026-09-14T00:00:00(+08:00)
 */
export function parseDateField(value: string): Date {
  const v = value.trim();
  // 已带时区:Z 后缀或 ±HH:MM / ±HHMM
  if (/[zZ]$/.test(v) || /[+-]\d{2}:?\d{2}$/.test(v)) {
    return new Date(v);
  }
  // 无时区:提取字段,按默认偏移构造
  const norm = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v + "T00:00:00" : v;
  const parts = norm.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!parts) return new Date(v); // 兜底:交给原生解析
  const y = Number(parts[1]);
  const mo = Number(parts[2]);
  const da = Number(parts[3]);
  const h = Number(parts[4]);
  const mi = Number(parts[5]);
  const s = parts[6] ? Number(parts[6]) : 0;
  // 该时刻按默认时区理解:内部 UTC = 字段值按 UTC 计 - 偏移
  return new Date(Date.UTC(y, mo - 1, da, h, mi, s) - DEFAULT_TZ_OFFSET_MIN * 60000);
}

/**
 * 归一化 frontmatter 中 YAML 已解析的 Date:YAML 把无引号纯日期字面量
 * (2026-09-14)先解析为 UTC 午夜 Date,时区信息已丢失。此处识别"UTC 时钟
 * 恰为整点午夜"的 Date(纯日期特征),按默认时区重解释为当日 00:00;
 * 带时刻的日期(不满足整点午夜)保持原时刻。
 */
export function normalizeDateField(d: Date): Date {
  const isMidnightUtc =
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0;
  if (!isMidnightUtc) return d;
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) -
      DEFAULT_TZ_OFFSET_MIN * 60000,
  );
}

/**
 * 统一短日期格式 YYYY/MM/DD(如 2026/10/04),按指定偏移显示。
 * SSR 兜底用默认时区(东八区);浏览器端由 time-localize.js 按系统时区重算。
 */
export function formatYmd(date: Date, offsetMin: number = DEFAULT_TZ_OFFSET_MIN): string {
  const shifted = new Date(date.getTime() + offsetMin * 60000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}/${p(shifted.getUTCMonth() + 1)}/${p(shifted.getUTCDate())}`;
}
