/**
 * 站点作者与联系信息配置(部署前按需修改)。
 * 邮箱拆分成 user/domain 两段存储,首页构建时编码为 base64 存 data 属性、
 * 客户端 atob 解码组装 mailto(静态 HTML 不出现明文邮箱,防简单爬虫抓取)。
 */
export const SITE = {
  /** 作者名(Email 收件人显示名) */
  ownerName: "LUO YUHAO",
  /** GitHub 主页 */
  githubUrl: "https://github.com/luoyuhao0x58",
  /** 邮箱:emailUser@emailDomain */
  emailUser: "luoyuhao",
  emailDomain: "opc.nettix.top",
};
