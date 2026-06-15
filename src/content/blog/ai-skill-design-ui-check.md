---
title: "nngn.devの設計レビューをCodex Skillで手順化する"
description: "Astro、Pagefind、Storybookで作っているこのリポジトリを、AIにどう読ませて、どこをスクショで確認させるかの実装メモ。"
publishedAt: 2026-06-14
tags:
  - ai
  - design
  - ui-test
  - codex
draft: false
---

このリポジトリは、Astroで作った小さな個人サイトだ。トップ、ブログ一覧、記事詳細、タグページ、検索モーダル、Storybook。画面数だけ見れば少ない。

ただ、AIに「設計とUIを見て」と頼むと、だいたい浅くなる。配色がどう、余白がどう、アクセシビリティに配慮しましょう、で終わる。そういう話は別にGoogleで読めるし、このリポジトリを見た意味がない。

ここでやりたいのは、nngn.devの実装に沿って、AIが読む順番と確認する状態を固定することだ。Codex Skillはそのために使っている。この記事では、一般的なSkillの説明ではなく、このリポジトリでAIに見せている技術的なポイントを書く。

<figure>
  <img src="/images/ai-skill-design-ui/home.png" alt="nngn.devのホーム画面。ヒーロー、GitHub activity、最新記事カードが並んでいる。" />
  <figcaption>トップページ。AIにはまず完成画面を見せる。コードだけ読ませると、カードの密度やファーストビューの見え方を外しやすい。</figcaption>
</figure>

## このリポジトリの構造

まず、AIに読ませる入口は決めている。

```text
src/content.config.ts      記事frontmatterの型
src/lib/blog.ts            公開判定、日付、URL、読了時間
src/lib/tags.ts            タグURLとソート
src/pages/index.astro      トップページ
src/pages/blog/index.astro ブログ一覧
src/pages/blog/[slug].astro 記事詳細
src/pages/blog/tags/[tag].astro タグページ
src/components/*.astro     表示部品
src/components/*.stories.ts Storybookの確認ケース
```

この順番にしているのは、ページから読ませると局所最適なレビューになりやすいからだ。たとえば`BlogCard`の余白だけを見ても、ホーム、ブログ一覧、タグページの3箇所で同じ部品が使われていることを見落とす。逆に`src/lib/blog.ts`から入ると、一覧と詳細のつながりを追いやすい。

`src/lib/blog.ts`には、かなり小さいが、このサイトの表示ルールが集まっている。

```ts
export function isPublishedPost(post: BlogPost) {
  return !post.data.draft;
}

export function sortPosts(posts: readonly BlogPost[]) {
  return [...posts].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export function getPostUrl(post: Pick<BlogPost, "id">) {
  return `/blog/${post.id}/`;
}
```

AIに設計レビューをさせるなら、まずここから見る。`draft`の扱い、日付降順、URL生成がページ側に散らばっていないか。UIの話に見えて、実際にはこのへんの小さい規約が崩れると一覧、タグ、検索結果の見え方がずれる。

## 記事詳細はPagefind用のメタが肝

このリポジトリで一番AIが読み飛ばしやすいのは、記事詳細ページの見えない要素だ。

`src/pages/blog/[slug].astro`では、本文の前にPagefind用のメタ情報を置いている。

```astro
<span style="display: none" data-pagefind-meta={`description:${post.data.description}`}></span>
<span style="display: none" data-pagefind-meta={`tags:${tagsMeta}`}></span>
{post.data.tags.map((tag) => <span style="display: none" data-pagefind-filter="tag">{tag}</span>)}
<time
  style="display: none"
  datetime={publishedAtTime}
  data-pagefind-meta="date[datetime]"
  data-pagefind-sort="date[datetime]"
>
  {publishedAtTime}
</time>
```

これは見た目には出ない。でも検索UIでは機能している。`description`が抜けると検索結果のfallbackが弱くなる。`tags`が抜けると検索結果カードからタグが消える。`date[datetime]`が抜けると、`SiteHeader.astro`側で指定している日付降順sortができない。

なので、AIに検索UIを見せるときは「モーダルが開くか」だけでは足りない。記事詳細がPagefindに渡しているメタ、Pagefindが生成したindex、検索結果の表示までを一本の流れとして見せる必要がある。

ここが、このリポジトリ固有の確認点だ。

## 検索UIはbuild後にしか本物にならない

検索UIは`src/components/SiteHeader.astro`に入っている。ボタン、モーダル、入力欄、結果描画、Pagefindの読み込みまで、ヘッダーコンポーネントに閉じている。

ポイントは、検索indexが`astro dev`ではできないことだ。`package.json`の`build`はこうなっている。

```json
{
  "build": "ASTRO_TELEMETRY_DISABLED=1 astro check && ASTRO_TELEMETRY_DISABLED=1 astro build && pagefind --site dist --force-language ja"
}
```

つまり、検索確認は`bun run build`後の`dist`でやる。AIが`bun run dev`だけで検索を確認すると、`/pagefind/pagefind.js`がない。その結果、catch側に入り、「Search is available after the site has been built with Pagefind.」を表示する。この挙動自体は正しいが、それを不具合として直されると困る。

Skillには、ここを明示しておく。

```text
Search UI changed:
1. run `bun run build`
2. run preview against `dist`
3. open `/`
4. open search
5. search `skill`
6. assert result title, URL, date, excerpt, and tags
```

実装側で見たいのは、次のつながりだ。

```text
frontmatter.description
  -> data-pagefind-meta="description:..."
  -> result.meta.description
  -> renderResult fallback excerpt

frontmatter.tags
  -> data-pagefind-meta="tags:..."
  -> result.meta.tags
  -> renderTags()

publishedAt
  -> datetime YYYY-MM-DD
  -> data-pagefind-sort="date[datetime]"
  -> pagefind.search(... sort: { date: "desc" })
```

ここまで指定しておくと、AIの確認が「検索欄が出ました」で止まらない。

<figure>
  <img src="/images/ai-skill-design-ui/search-modal.png" alt="nngn.devの検索ダイアログ。検索欄にskillと入力され、記事の検索結果が表示されている。" />
  <figcaption>検索モーダル。これはdev serverではなく、Pagefind indexを生成したあとに撮っている。</figcaption>
</figure>

## SiteHeaderの検索実装で見ているところ

`SiteHeader.astro`の検索は、わざと大きなライブラリを入れていない。素のDOM操作で済ませている。

AIにレビューさせるときは、デザインより先にこの4点を見る。

1つ目は、初期化時に必要な要素が揃っているかを型で確認していること。

```js
if (
  !(trigger instanceof HTMLButtonElement) ||
  !(backdrop instanceof HTMLElement) ||
  !(panel instanceof HTMLElement) ||
  !(input instanceof HTMLInputElement) ||
  !status ||
  !resultsList
) {
  throw new Error("Search header markup is missing required elements.");
}
```

この実装には、ビルド時に壊れた検索UIを検出する仕組みがない。そこで、少なくともブラウザで開いた時点で必須要素が欠けていたら即座に落とす。AIがマークアップを触るときは、このガードとDOMのid/classがずれていないかを見る。

2つ目は、検索結果の競合対策だ。

```js
let searchRun = 0;

const search = async () => {
  const query = input.value.trim();
  const currentRun = ++searchRun;

  // ...

  if (currentRun !== searchRun) return;
};
```

Pagefindの検索と`result.data()`は非同期だ。入力が速いと、古い検索結果があとから返ってくる可能性がある。ここでは`searchRun`で古い結果を捨てている。小さい実装だが、AIが「もっとシンプルに」と言って消しがちなところでもある。

3つ目は、`innerHTML`を使う代わりに`escapeHtml`を通していること。

```js
const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
```

検索結果は自分のMarkdownから来るので外部入力ではない。とはいえ、記事タイトルやdescriptionにHTMLっぽい文字列を書く可能性はある。`renderResult`はテンプレート文字列でHTMLを作るので、このescapeは残しておきたい。

4つ目は、モーダルの閉じ方。検索ボタン、backdrop、Escape、外側クリックをそれぞれ扱っている。見た目だけの確認だと、Escapeで閉じない、閉じたあとtriggerへfocusが戻らない、という退行を見落とす。

このへんは「AIにUIテストをさせる」より、「AIに状態遷移を読ませる」と言ったほうが近い。

## Storybookは通常状態ではなく壊れやすい状態を見る

Storybookを入れている理由は、ページ全体を開くより小さい単位で確認できるからだ。ただし、Default storyだけ見てもあまり意味がない。

このリポジトリで肝になるのは、壊れやすい状態をstoryにしているところだ。

```ts
export const LongerTitle = {
  args: {
    ...Default.args,
    title: "Keeping a developer site useful without turning it into a product landing page",
    description: "A slightly longer summary to check card height, wrapping, and scan behavior.",
    tags: ["design", "writing"],
  },
};
```

`BlogCard`はホーム、ブログ一覧、タグページで使われている。長いタイトルが崩れると3箇所に出る。だからAIには、まず`BlogCard.LongerTitle`を見るように指示する。

`BlogArticleHeader`では`Updated`を見る。公開日、更新日、読了時間、タグが横並びになるので、ここは小さい画面で折り返しやすい。`TagList`では`Linked`と`Compact`を見る。カード内タグと一覧上部のタグでは密度が違う。

Skillに書くなら、こうなる。

```text
If BlogCard changed:
- inspect BlogCard.Default
- inspect BlogCard.LongerTitle
- verify home, blog index, tag page use the same visual assumptions

If BlogArticleHeader changed:
- inspect Default
- inspect Updated
- verify Japanese title wrapping on article page

If TagList changed:
- inspect Linked
- inspect Compact
- verify linked tag URLs still use `toTagPath`
```

Storybookを「部品一覧」として使うのではなく、AIに壊れやすい入力を渡す場所として使っている。

## 日本語記事で読了時間が雑になる

このリポジトリには、日本語記事の表示テストがある。ここはAIレビューで見つけてほしいポイントでもある。

`estimateReadingMinutes`は今こうなっている。

```ts
export function estimateReadingMinutes(body: string | undefined) {
  const words = (body ?? "").trim().split(/\s+/u).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}
```

英語記事ならだいたい動く。日本語本文はスペースで分かち書きしないので、かなり雑になる。現状の記事量だと全部`1 min read`に収まっているため目立たないが、長い日本語記事を増やすなら文字数ベースに変える必要がある。

こういうものはスクショだけでは見つからない。AIに「日本語記事の表示を見て」と頼むと、行間や折り返しは見るが、読了時間の算出までは見ないことがある。だからSkillでは、UI確認の前に`src/lib/blog.ts`を読ませる。

今すぐ直すなら、たとえば日本語文字を含む本文では文字数ベースに寄せる。

```ts
const japaneseCharacters = [...text].filter((char) => /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}/u.test(char)).length;
```

まだこのサイトの規模では直していないが、「日本語記事を増やすなら先に直す場所」として、AIに検出させたいポイントだ。

## タグURLは小さいが壊すと広く響く

タグまわりは`src/lib/tags.ts`に逃がしている。

```ts
export function toTagPath(tag: string) {
  return `/blog/tags/${encodeURIComponent(tag)}/`;
}
```

`TagList.astro`はこの関数を使う。一方で、タグページの`getStaticPaths`も`encodeURIComponent(tag)`を使っている。

```ts
return uniqueTags(posts).map((tag) => ({
  params: { tag: encodeURIComponent(tag) },
  props: {
    tag,
    posts: sortPosts(posts.filter((post) => post.data.tags.includes(tag))),
  },
}));
```

ここは将来、タグにスペースや日本語を入れたときに影響する。今のタグは`ai`、`design`、`ui-test`のような安全な文字だけなので、普通に見ていると問題が見えない。AIには、現在のデータだけでなく、URLエンコードが必要な入力を想定して読ませる。

この確認はスクショではなくコードレビューでやる。見た目のタグchipが正しくても、リンク先生成がずれていたらタグページに飛べない。

## スクショは成果物として記事に残す

今回の記事では、スクショを`public/images/ai-skill-design-ui/`に置いている。

```text
public/images/ai-skill-design-ui/home.png
public/images/ai-skill-design-ui/search-modal.png
```

Markdown本文からは`/images/...`で参照する。Astroのcontent collectionで画像importを使っていないのは、記事を書くだけならpublic配下のほうが扱いが単純だからだ。

その代わり、本文用に`global.css`へ`figure`と`figcaption`の最低限のスタイルを足した。

```css
.blog-prose figure {
  margin-block: 2rem;
  margin-inline: 0;
}

.blog-prose figure img {
  border: 1px solid var(--color-line);
  border-radius: 8px;
  background: white;
  box-shadow: 0 10px 28px rgb(15 23 42 / 0.08);
}
```

これはUI実装としては小さいが、AIに記事を書かせるときには重要だ。スクショを本文に入れろと頼むと、画像だけ置いてcaptionが弱くなりがちだ。この記事では、画像は「見た目の証拠」で、captionは「AIに何を確認させたか」を書く場所にしている。

## Skillに落とすならこう書く

このリポジトリ用のSkillは、汎用的な「Astroサイトを確認するSkill」ではなく、nngn.devの癖をそのまま書く。

```md
## nngn.dev specific checks

Before UI comments:
- read `src/lib/blog.ts`
- read `src/lib/tags.ts`
- read the touched route and component

For article changes:
- confirm frontmatter matches `src/content.config.ts`
- confirm tags appear in article header, card, tag page, and Pagefind meta
- confirm screenshots live under `public/images/...` when referenced from Markdown

For search changes:
- do not verify search with `bun run dev`
- run `bun run build`
- preview `dist`
- search for a term from the changed article
- inspect result title, URL, date, excerpt, and tags
- check Escape, backdrop click, outside click, and focus return

For component changes:
- inspect matching Storybook edge-case story
- then inspect the route that uses the component in context

Always finish with:
- `bun run build`
- `bun run build-storybook`
```

これくらい具体的に書かないと、このリポジトリでAIに確認させる意味が薄い。AIに自由に考えさせる部分は、スクショを見た後の「どこが読みにくいか」だけでよい。どのファイルを読むか、どのrouteを開くか、どのコマンドを通すかは固定する。

## まとめ

このリポジトリでの工夫は、AIに特別なレビュー能力を期待しないことだ。代わりに、AIが迷いやすい部分を先に手順へ落としている。

- Pagefind用のhidden metaは、見た目に出ないが検索結果を決める
- 検索UIは`astro dev`ではなくbuild後のpreviewで確認する
- `SiteHeader.astro`の検索は、非同期競合、escape、focus returnを見る
- StorybookはDefaultではなくedge-case storyを見る
- 日本語記事では読了時間の算出が粗いので、UIではなく`src/lib/blog.ts`を見る
- タグURLは現在の短いタグだけでなく、encodeが必要な値を想定する

こういう確認は、一般的な「AIでUIレビュー」記事にはあまり出てこない。でも、このリポジトリではここを見ないと意味がない。Skillは、そのリポジトリ固有の見落としポイントを書いておく場所として使うのが一番しっくりきている。
