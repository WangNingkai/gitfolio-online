![](https://cdn.jsdelivr.net/gh/wangningkai/wangningkai/assets/20200726173312.png)

# Gitfolio-online

![GitHub top language](https://img.shields.io/github/languages/top/wangningkai/gitfolio-online.svg?style=popout-square)
![GitHub last commit](https://img.shields.io/github/last-commit/wangningkai/gitfolio-online.svg?style=popout-square)
![GitHub](https://img.shields.io/github/license/wangningkai/gitfolio-online.svg?style=popout-square)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![visitors](https://visitor-badge.laobi.icu/badge?page_id=WangNingkai.gitfolio-online)

> **[中文 README](./README_CN.md)**

## 介绍

> 适合于每个 Github 用户的在线个人网站

Gitfolio 将帮助你组建一个可以展示 Github 成果的网站.

点击这里查看演示 [live demo](https://gitfolio-online.vercel.app/user/wangningkai).

## 特性

- 简单快捷
- 支持黑白主题
- 可定制化的

## Getting Started

复制下面内容在浏览器打开!

修改 `username` 为你的 GitHub's 用户名.

```
https://gitfolio-online.vercel.app/user/{username}?theme={theme}&includeFork={includeFork}&cache_seconds={cache_seconds}
https://gitfolio-online.vercel.app/u/{username}?theme={theme}&includeFork={includeFork}&cache_seconds={cache_seconds}
```

#### 主题

使用 `?theme=THEME_NAME` 参数像这样 :-

```
https://gitfolio-online.vercel.app/u/{username}?theme=dark/light
```

#### 引入 Forks 仓库

使用 `?includeFork=true/false` 参数选择是否显示 Forks 仓库

```
https://gitfolio-online.vercel.app/u/{username}?includeFork=true/false
```

#### 参数

你可以通过以下参数自定义显示内容

| Option        | type   | description                          | default       |
| ------------- | ------ | ------------------------------------ | ------------- |
| username      | string | set username                         | 'wangningkai' |
| theme         | string | sets inbuilt theme                   | 'dark'        |
| cache_seconds | number | manually set custom cache control    | 1800          |
| includeFork   | bool   | select whether to display fork repos | false         |
| repoNum       | number | display repos number                 | 30            |

## 部署到 Vercel 实例

因为 GitHub 的 API 每个小时只允许 5 千次请求，我的 `https://gitfolio-online.vercel.app/api` 很有可能会触发限制 如果你将其托管在自己的 Vercel 服务器上，那么你就不必为此担心。点击 deploy 按钮来开始你的部署！

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/wangningkai/gitfolio-online)

## 问题反馈

> 进行任何操作前请先阅读 [《提问的智慧》](https://github.com/ruby-china/How-To-Ask-Questions-The-Smart-Way/blob/master/README-zh_CN.md)

当前获取帮助有三种方式：

1. 通过 [GitHub issue](https://github.com/WangNingkai/gitfolio-online/issues) 提交问题（仅限问题反馈）
2. 通过 [个人博客](https://imwnk.cn) 评论留言
3. 通过个人邮箱联系 [i@ningkai.wang](mailto:i@ningkai.wang)

## :sparkling_heart: 支持这个项目

我尽己所能地进行开源，并且我尽量回复每个在使用项目时需要帮助的人。很明显，这需要时间，但你可以免费享受这些。

然而, 如果你正在使用这个项目并感觉良好，或只是想要支持我继续开发，你可以通过如下方式：

- Star 并 分享这个项目 :rocket:
- [![paypal.me/wangningkai](https://ionicabizau.github.io/badges/paypal.svg)](https://www.paypal.me/wangningkai) - 你可以通过 PayPal 一次性捐款. 我多半会买一杯 咖啡 茶. :tea:
- [Wechat & AliPay](https://pay.ningkai.wang)

谢谢! :heart:

## License

![GitHub](https://img.shields.io/github/license/imfunniee/gitfolio.svg?style=popout-square)

---

欢迎贡献哦! <3

Made with ❤️ and JavaScript.
