---
title: "ISUCON2026 で 256 位だった"
description: "チーム mnm で出て、初期 2,720 点から 65,645 点まで上げた。順位は 579 チーム中 256 位。"
date: 2026-11-03
---

2026年10月31日、チーム [mnm](https://isucon.net/archives/isucon2026-teams.html) で ISUCON2026 に出た。メンバーは [kefi550](https://github.com/kefi550)、sohaya、自分。

課題は [ISUReal](https://github.com/kefi550/isucon2026/blob/7461d9e45cf432bedbc01008280b1d42e40a386c/docs/manual.md#L12)。友達と写真を共有するサービスを、Go と PostgreSQL のまま速くする 8 時間だった。

[公式の結果](https://isucon.net/archives/60126600.html)は [256 位](https://isucon.net/archives/60126600.html)、[65,645 点](https://isucon.net/archives/60126600.html)。順位が付いたのは 579 チームで、mnm の学生欄は空だった。朝の初期スコアは kefi550 の記録で [2,720 点](https://github.com/kefi550/isucon2026/commit/ad29350) なので、終了時は約 24 倍。ひとつ上の温泉学校は [65,652 点](https://isucon.net/archives/60126600.html) で、差は 7 点だった。優勝の Typing Bears は [625,857 点](https://isucon.net/archives/60126600.html)。

ここから先の点数は、その変更を入れたコミットのメッセージに書いてある。3 人で同じ main に積んでいたので、数字には前後の変更が混ざる。下がったものも履歴に残してある。

## 投稿が 1 件ずつしか進まなかった

ningen が index を足して [3,833 点](https://github.com/kefi550/isucon2026/commit/aa8c622)。sohaya がフィードの絞り込みを SQL に寄せて [6,108 点](https://github.com/kefi550/isucon2026/commit/b37633c)。ningen が画像 URL の署名をキャッシュして [7,026 点](https://github.com/kefi550/isucon2026/commit/6155779)。11 時 20 分に、ningen が投稿の遅れの本体を外した。

`POST /api/posts` は、開いている投稿期間の行を `FOR UPDATE` で掴んだまま、画像の INSERT が終わるまで離さない。同じリージョンの投稿は、1 件ずつ順番にしか進まない。このロックをやめて [10,162 点](https://github.com/kefi550/isucon2026/commit/47c5d43)。

11 時 53 分、ningen が通知を broker にまとめて配るように変えたら [9,392 点](https://github.com/kefi550/isucon2026/commit/f6f582b) になった。筋は通って見えて、点数は落ちた。

## 往復を 1 回にする

昼から、クエリの往復を潰した。sohaya が画像取得で `created_at` を覚えて、見るパーティションを絞ると [13,969 点](https://github.com/kefi550/isucon2026/commit/e1c51c9)。4 分後、ningen が投稿を DB 関数の 1 往復にして、フィードを並列にし、接続プールを広げて [20,255 点](https://github.com/kefi550/isucon2026/commit/c6c8067)。ログインは ningen の別コミットで、1.6 秒から 0.2 秒になり、その計測は [18,106 点](https://github.com/kefi550/isucon2026/commit/abd4f80)。ningen が RealMoji とコメントの作成・削除も同じ形にして [21,124 点](https://github.com/kefi550/isucon2026/commit/ce202ae)。kefi550 が、投稿期間が始まるときの notifications の書き込みを減らして [25,279 点](https://github.com/kefi550/isucon2026/commit/95e8301)。

14 時 2 分はアプリ側だった。ningen が投稿画像の検証で、全画素をデコードするのをやめてヘッダだけ読む。[33,086 点](https://github.com/kefi550/isucon2026/commit/651fc90)。署名付き URL を、同じ鍵と画像の組なら 60 秒使い回して [35,936 点](https://github.com/kefi550/isucon2026/commit/bb6922f)。

そこから約 1 時間、点数は 35,000 前後で動かなかった。sohaya の作者ごとの index が [35,870 点](https://github.com/kefi550/isucon2026/commit/24bc143)、ningen の DB メモリ変更が [35,423 点](https://github.com/kefi550/isucon2026/commit/c8880a5)、sohaya の実行計画の使い回しが [35,815 点](https://github.com/kefi550/isucon2026/commit/2a7aa5f)。

## 署名を速いほうのマシンで先にやる

15 時 17 分、ningen がユーザー検索をアプリで絞り込むのをやめて、正規化した列で DB に寄せた。asia の DB 接続数は 24 まで絞った。[46,399 点](https://github.com/kefi550/isucon2026/commit/98c01cb)。同じころ、kefi550 が今日の画像を id のハッシュで 16 パーティションに割った計測は [33,645 点](https://github.com/kefi550/isucon2026/commit/fcc1eae) で、前後より低かった。初期データの画像を DB ではなくファイルから返すほうは [44,810 点](https://github.com/kefi550/isucon2026/commit/379b2e1)。

sohaya の振り返りには、アプリ 1 台だけ CPU が古く SHA の命令がなく、署名が他の台の [約 3 倍遅かった](https://github.com/kefi550/isucon2026/blob/3021b4e/docs/retrospective-hahahayatoo.md#L20) とある。16 時 30 分、ningen が `/api/initialize` のときに isu2 と isu3 へ分けて、画像の署名を先に計算するようにした。[50,674 点](https://github.com/kefi550/isucon2026/commit/cf352d0)。

## 17 時を過ぎてから

kefi550 がファイルを同時に開ける数の上限を緩めると [57,842 点](https://github.com/kefi550/isucon2026/commit/015b862)。マニュアルでは [17 時にリーダーボードの更新が止まる](https://github.com/kefi550/isucon2026/blob/7461d9e45cf432bedbc01008280b1d42e40a386c/docs/manual.md#L6)。この 57,842 点が、その前に残っているいちばん高い数字だった。

17 時を過ぎて、kefi550 が接続プールを増やした計測は [55,480 点](https://github.com/kefi550/isucon2026/commit/c788da8)、さらにいじると [47,174 点](https://github.com/kefi550/isucon2026/commit/ad8b292) まで落ちた。PostgreSQL の集計を止めて [57,966 点](https://github.com/kefi550/isucon2026/commit/6ce534f)。この時間帯は、接続を増やすと点数が落ちた。

ningen が 17 時 33 分にアプリケーションログを止めて [60,764 点](https://github.com/kefi550/isucon2026/commit/2f87442)。kefi550 の 17 時 52 分が [65,039 点](https://github.com/kefi550/isucon2026/commit/6f9e7e1)、ningen の 17 時 54 分の最後が [65,645 点](https://github.com/kefi550/isucon2026/commit/7461d9e)。競技終了は [18 時](https://github.com/kefi550/isucon2026/blob/7461d9e45cf432bedbc01008280b1d42e40a386c/docs/manual.md#L7)。公式の 65,645 点は、この最後のコミットと一致している。終盤の伸びは、公開リーダーボードが止まったあとに付いた。
