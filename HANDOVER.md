# nngn.dev 引継書

> 別エージェントへの作業引継用メモ。2026-11-03 時点。用が済んだら削除してよい。

## 1. プロジェクト概要

個人のポートフォリオ + 技術ブログサイト。**機能は最小限、UI の色とデザイントークンにこだわる**のが目的。旧実装(Astro 6 + org-mode + Storybook + 旧記事)は 2026-11-03 にリポジトリごと全削除して新規構築し直した。

- リポジトリ: `/home/ningen/ghq/github.com/ningen/nngn.dev`(WSL 内)
- サイト URL(予定): https://nngn.dev
- 技術スタック: **Astro 7 + Tailwind CSS v4(`@theme` でトークン管理)+ Markdown ブログ / bun / Cloudflare Pages**

## 2. 決定済みの方針(ユーザーの意向。覆すときは要確認)

| 項目 | 決定 | 備考 |
|---|---|---|
| カラースキーム | **ライトのみ** | ダークモード対応はしない |
| 言語 | 日本語メイン | 欧文・数字は Inter で整える |
| アクセントカラー | インディゴ `#4f46e5` | 6 候補からユーザーが選択(スウォッチ提案ページで決定) |
| ブログ形式 | **Markdown**(org-mode は廃止) | 旧記事は削除して良い |
| タグ機能 | **削除済み** | 「記事を積み重ねることを優先」との意向。必要になったら復活 |
| Storybook | **不使用** | デザイン確認はサイト内 `/styleguide` ページで行う |
| ブログ一覧 UI | **エディトリアル・リスト型** | カード・ピル・影などの「AI っぽい」装飾は NG(ユーザー明言) |
| ヒーロー演出 | **なし(Three.js は撤去)** | ドットジオラマは水準に届かず、2026-11-03 に削除。戻さない |

## 3. デザイントークン

**単一の情報源: `src/styles/global.css` の `@theme` ブロック。** UI の色・書体・角丸・影はすべてここで管理し、Tailwind ユーティリティ(`bg-accent` など)として使う。

```css
/* ニュートラル(stone 系) */
--color-background: #fafaf9;   /* ページ背景(紙色) */
--color-surface: #ffffff;      /* カード面 */
--color-surface-2: #f5f5f4;    /* コード背景など */
--color-border: #e7e5e4;
--color-border-strong: #d6d3d1;
/* テキスト */
--color-foreground: #1c1917;   /* 本文 */
--color-foreground-2: #57534e; /* 補足 */
--color-foreground-3: #78716c; /* メタ情報 */
/* アクセント(インディゴ) */
--color-accent: #4f46e5;       /* 白文字比 6.3:1 (WCAG AA) */
--color-accent-hover: #4338ca;
--color-accent-tint: #eef2ff;
--color-on-accent: #ffffff;
/* タイポ */
--font-sans: Inter + Zen Kaku Gothic New(日本語)+ システムフォールバック
--font-mono: JetBrains Mono
--text-base: 15px / 行間 1.8(読みやすさ優先)
--text-sm: 14px / 1.7
/* 角丸・影 */
--radius-sm/md/lg: 4/8/12px
--shadow-sm/md: ほんのり / ふんわり
```

その他グローバル指定: `::selection` はアクセント背景、`:focus-visible` はアクセントのアウトライン。ブログ本文は `@utility prose`(h2/h3, p, a, ul/ol, code/pre, blockquote, hr)でスタイリング。フォントは Google Fonts の `<link>`(BaseLayout 内)。

## 4. サイト構成

```
/                    導入文 + 最近の投稿 3 件 + About
/blog/               投稿一覧(エディトリアル・リスト)
/blog/[slug]/        記事ページ(prose)
/styleguide/         デザイントークン・コンポーネントの実物見本(デザイン確認用ページ)
```

主なファイル:

```
astro.config.mjs        site: https://nngn.dev、Tailwind Vite プラグイン
src/styles/global.css   ★デザイントークンの単一の情報源(@theme)
src/content.config.ts   blog コレクション(glob loader)。スキーマ: title / description / date
src/content/blog/       Markdown 記事置き場(現在サンプル 1 件 = design-tokens.md、削除可)
src/layouts/BaseLayout.astro  共通レイアウト(head・フォント読み込み・ヘッダー/フッター)
src/components/
  SiteHeader.astro      ナビ(アクティブはインディゴ下線。ピル型タイルは廃止済み)
  SiteFooter.astro
  BlogListItem.astro    投稿 1 件分(罫線区切りリスト。ホバーでタイトルがインディゴ + 矢印が動く)
  BlogProse.astro       記事本文ラッパー(.prose)
src/lib/format.ts       日付整形(ja-JP)
```

### 記事の追加方法

`src/content/blog/` に Markdown を置くだけ。ファイル名がスラッグになる。

```md
---
title: "記事タイトル"
description: "記事の説明"
date: 2026-11-03
---

本文。
```

## 5. ヒーロー演出は撤去済み

Three.js のドットジオラマ(家とねこ)は、点でも立方体でも求めていた水準に届かなかったため削除した。`three` と `HeroDots.astro` / `src/lib/diorama.ts` はリポジトリに無い。戻さない。

トップは導入文とボタンだけ。下の投稿一覧と同じ `max-w-3xl` のカラムに揃えている。

## 6. 作業履歴(git log)

```
b472cf7 fix(home): make dot diorama readable as a house and cat
9c9ab88 feat(home): replace torus knot with cat diorama dots
3eb8e1e feat(home): add three.js dot torus knot to hero
1cba304 feat(blog): switch to editorial list and drop tags
2c3b983 feat: rebuild site with Astro and Tailwind design tokens
```

履歴は新規作成のため上記がすべて。コミットメッセージは Conventional Commits 風。

## 7. 未完了タスク

1. **origin の再接続と force push(要ユーザー確認)**
   - 旧リポジトリは履歴ごと全削除したため、ローカルは root commit から作り直し
   - リモート: `ssh://git@github.com/ningen/nngn.dev.git`(削除時に控えた URL)
   - push 時は force push が必要。GitHub 側の旧ブランチが消えることをユーザーに確認すること
2. **Cloudflare Pages のデプロイ設定**
   - 旧設定はリポジトリ削除で消えた(旧: `wrangler pages project create nngn-dev --production-branch main`、`wrangler pages deploy dist` 方式)
   - 再構築が必要。wrangler は未導入なので `bun add -d wrangler` から
3. **記事の充実**(ユーザーの最優先事項。まず記事を積み重ねたい)
4. 将来の候補(現状は未着手): Shiki によるシンタックスハイライト / 検索 / RSS / タグ復活 / ビジュアルリグレッション

## 8. 開発環境のメモ

- WSL(Ubuntu-24.04)上の Linux。Windows 側ブラウザで確認する運用
- 開発サーバーは **`bun astro dev --background`**(AGENTS.md に記載の Astro 7 標準機能)。`bun astro dev status / logs / stop` で管理
- 現在開発サーバー起動中: http://localhost:4321(引き継ぎ時に `bun astro dev status` で確認)
- コマンド: `bun run dev`(通常起動)/ `bun run build`(静的ビルド、4 ページ)/ `bun run preview`
- ビルドは `dist/` に静的出力
- ユーザーにファイルを見せる場合は `explorer.exe '\\wsl.localhost\Ubuntu-24.04\<パス>'`(workdir は /mnt/c 推奨)
- スクリーンショットはユーザーから不要との指示あり(開発サーバーで直接確認する)

## 9. スタイルの掟(このプロジェクトの好み)

- **「AI っぽい」デザインは即却下される**: 角丸だらけのカード、アクセント色のピルチップ、影付きボタンの山、グラデーション等。罫線・タイポグラフィ・余白で表現する
- 日本語タイポを尊重(行間 1.8、Zen Kaku Gothic New、見出しは太字 + 詰め気味 tracking)
- 色はトークン経由以外でハードコードしない
- 装飾は「人力感」のあるものを好む(エディトリアル、ドット絵、遊び心)
