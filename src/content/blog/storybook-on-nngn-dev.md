---
title: "Storybookをnngn.devで見られるようにした"
description: "ローカルだけで見ていたStorybookを、Cloudflare Pagesの静的ビルドに含めて /storybook/ で開けるようにしたメモ。"
publishedAt: 2026-06-15
tags:
  - storybook
  - astro
  - cloudflare
  - note
draft: false
---

このサイトのStorybookは、これまでローカルでだけ見ていた。

```sh
bun run storybook
```

それでも開発中は十分だが、外から確認したいときには少し面倒だった。なので、Astroの本体ビルドと同じ`dist`にStorybookも入れて、`https://nngn.dev/storybook/`で見られるようにした。

やったことは小さい。`bun run build`の最後でStorybookの静的ビルドも走らせる。

```json
{
  "build": "ASTRO_TELEMETRY_DISABLED=1 astro check && ASTRO_TELEMETRY_DISABLED=1 astro build && pagefind --site dist --force-language ja && bun run build-storybook",
  "build-storybook": "CI=1 STORYBOOK_DISABLE_TELEMETRY=1 storybook build --output-dir dist/storybook && rm -f dist/storybook/_headers"
}
```

Cloudflare Pagesは`dist`をそのまま配信しているので、`dist/storybook/index.html`ができれば、そのまま`/storybook/`になる。別のPages projectを作るほどでもないし、このサイトのコンポーネント確認用なので同じドメインに置くほうが扱いやすい。

ひとつだけ引っかかったのはHTTP headerだった。

このサイトでは全体に`X-Frame-Options: DENY`を付けている。StorybookはCanvasの中でpreviewをiframe表示するので、これが残っているとStorybook本体は開いても、肝心のコンポーネント表示が止まる。

そこで`/storybook/*`だけは同一オリジンのiframeを許可する。

```text
/storybook/*
  ! X-Frame-Options
  X-Frame-Options: SAMEORIGIN
  X-Robots-Tag: noindex
```

`X-Robots-Tag: noindex`も付けた。Storybookは公開されていてもよいが、検索結果に出したいページではない。

ビルド後は、Cloudflare Pagesのローカルプレビューで確認した。

```sh
bun run build
bunx wrangler pages dev dist --port 8788
```

`/storybook/`と`/storybook/iframe`がどちらも`200`で返り、headerもStorybook配下だけ`SAMEORIGIN`になっていることを見た。最後にChrome headlessで`/storybook/?path=/story/blog-blogcard--default`を開いて、`BlogCard`のstoryがCanvas内に描画されるところまで確認した。

これで、記事やコンポーネントを触ったあとに「この状態、外でも見える？」を確認しやすくなった。
