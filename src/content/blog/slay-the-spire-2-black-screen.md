---
title: "NixOS で Slay the Spire 2 が真っ暗(音だけ出る)になったのを直した"
description: "Hyprland + NVIDIA で画面だけ真っ暗、音は出る症状の原因は D3D12 のスワップチェーン作成失敗。Godot のレンダラーを Vulkan に切り替えて解決した話と、Steam 起動オプションの書き位置でハマった話。"
date: 2026-11-10
---

Slay the Spire 2 を起動すると音は出るのに画面が真っ暗、という症状に遭遇した。環境は NixOS + Hyprland + NVIDIA(RTX 3060 Ti)。

## 原因

STS2 は Godot 製で、Proton 経由では D3D12 レンダラーが使われる。ゲームのログを見ると:

```
D3D12 12_0 - Forward+ - Using Device #0: NVIDIA GeForce RTX 3060 Ti
ERROR: ... ERR_CANT_CREATE
   at: swap_chain_resize (drivers/d3d12/rendering_device_driver_d3d12.cpp)
```

D3D12→Vulkan 変換を担う vkd3d-proton が NVIDIA + Wayland 上でスワップチェーンを作れず、描画だけが死んでいた。音とセーブ処理は生きているので音だけ聞こえる、という状態になる。

ログの場所は Steam の互換プレフィックス配下:

```
~/.local/share/Steam/steamapps/compatdata/2868840/pfx/drive_c/users/steamuser/AppData/Roaming/SlayTheSpire2/logs/godot.log
```

## 対処

Godot のレンダラーを Vulkan に切り替える。Steam の起動オプションに:

```
%command% --rendering-driver vulkan
```

起動後のログ先頭はこう変わり、エラーも消えた:

```
Vulkan 1.4.329 - Forward+ - Using Device #0: NVIDIA GeForce RTX 3060 Ti
```

## ハマりポイント: 引数は `%command%` の後ろに書く

最初は `--rendering-driver vulkan %command%` と前に書いて起動したら即クラッシュした。Steam は `%command%` より前のトークンを「実行するコマンド」として扱うため、`--rendering-driver` を実行しようとして command not found で落ちていた。`gameprocess_log.txt` に実際の起動コマンドが残っていて判明した。

ゲームへの引数は必ず `%command%` の後ろに置く。

## まとめ

- 「音は出るのに画面が真っ暗」はスワップチェーン系の失敗が定番。まずゲームのログを見る
- Godot 製ゲームは `--rendering-driver vulkan` で直ることが多い
- Steam 起動オプションのゲーム引数は `%command%` の後ろ
