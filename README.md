# nngn.dev

ポートフォリオと技術メモのサイト。色・タイポグラフィなどの**デザイントークンにこだわって設計**しています。

## 技術スタック

- [Astro](https://astro.build)(静的サイト生成)
- [Tailwind CSS v4](https://tailwindcss.com)(`@theme` でトークン管理)
- Markdown ベースのブログ(Content Collections)
- Bun / Cloudflare Pages

## デザイントークン

UI の見た目の単一の情報源は [`src/styles/global.css`](src/styles/global.css) の `@theme` ブロックです。

- カラー: stone 系ニュートラル + インディゴアクセント(`#4f46e5`)
- タイポグラフィ: Zen Kaku Gothic New + Inter + JetBrains Mono、本文 15px / 行間 1.8
- 角丸・影: `--radius-*` / `--shadow-*`

全トークンの実物見本はサイト内の **/styleguide** ページで確認できます。

## 開発

```sh
bun install
bun run dev       # 開発サーバー
bun run build     # 静的ビルド
bun run preview   # ビルド結果の確認
```

## ブログ記事の追加

`src/content/blog/` に Markdown を置くだけです。ファイル名が URL のスラッグになります。

```md
---
title: "記事タイトル"
description: "記事の説明"
date: 2026-11-03
---

本文はここから。
```
