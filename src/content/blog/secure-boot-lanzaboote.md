---
title: "NixOS と Windows のデュアルブートで Secure Boot を有効にした"
description: "Windows 側のアンチチートが Secure Boot を要求するので、NixOS は lanzaboote + sbctl で署名した。ASUS マザボのファクトリー鍵が何度も戻ってきた話と、Setup Mode が抜けなかった話。"
date: 2026-11-08
---

Windows 側で Secure Boot を有効にしたかった。ゲームのアンチチートが要求するためだ。NixOS と Windows のデュアルブートで、Windows は別ディスクに入っていて、それぞれが自分の ESP を持っている。

これまで Secure Boot は無効で、NixOS は systemd-boot から起動していた。NixOS 側は lanzaboote で UKI に署名し、Windows 側は Microsoft の鍵で起動できるようにする。lanzaboote は別 ESP の Windows をブートメニューに追加できないので、Windows はファームウェアのブートメニュー（F11）から起動する運用にした。

## 先に Windows のブートエントリを戻す

作業を始めた時点で、EFI 変数に Windows Boot Manager がなかった。おそらく NixOS を入れたときか、その後の操作で消えたのだと思う。`efibootmgr` で Windows の ESP にある `\EFI\Microsoft\Boot\bootmgfw.efi` を指すエントリを作り直し、F11 から Windows が起動することを確認した。

Secure Boot を触る前に Windows が起動できる状態を作っておく。ここが崩れると復旧が面倒になる。実際、この確認をしておいたおかげで、後で Secure Boot が有効にならなくてもWindows だけは起動できる、という安心感があった。

## lanzaboote を入れて先に署名する

やることは、sbctl で鍵を作り、lanzaboote を有効にして UKI に署名し、そのあとでファームウェアに鍵を登録する。順番が大事で、**署名済みのブートローダーを用意する前に鍵を登録すると、Secure Boot を有効にした瞬間に NixOS が起動できなくなる**。

`flake.nix` に lanzaboote を足して、NixOS の設定を次のようにした。

```nix
boot.loader.systemd-boot.enable = lib.mkForce false;
boot.loader.efi.canTouchEfiVariables = true;
boot.lanzaboote = {
  enable = true;
  pkiBundle = "/var/lib/sbctl";
  configurationLimit = 5;
};
```

`configurationLimit` は 5 にした。ESP が 1GB しかなく、UKI はカーネルと initrd をまとめた分だけ大きい。世代を 10 個も残すと空きが怪しくなる。

鍵を作って、適用して、署名を確認する。

```bash
sudo sbctl create-keys
nix run .#switch
sudo sbctl verify
```

`sbctl verify` で、`EFI/Linux/*.efi` と `systemd-bootx64.efi`、`BOOTX64.EFI` が signed になっていればよい。古い systemd-boot の残骸（`EFI/nixos/kernel-*.efi` や `systemd-boot-fallbackx64.efi`）は unsigned のまま残るが、lanzaboote の起動には使われないのでそのままにした。

## BIOS の設定

マザーボードは ASUS PRIME Z690-P D4。BIOS の Boot → Secure Boot に設定がある。

- OS Type: **Windows UEFI mode**
- Secure Boot Mode: **Custom**
- Key Management → **Clear Secure Boot keys**

このボードに `Factory Key Provision` という項目はない。代わりに `Install Default Secure Boot keys` があり、これを押すと ASUS のファクトリー鍵に戻る。押してはいけない。

OS Type の `Other OS` は Secure Boot の強制を無効にする。Secure Boot を有効にしたいなら Windows UEFI mode を選ぶ。ただし、OS Type を変えるとファクトリー鍵が戻ることがあるので、**OS Type を先に確定させてから Clear する**。

## immutable な efivar を外す

`sbctl enroll-keys --microsoft` を実行すると、KEK と db の efivar が immutable だと言われた。

```text
File is immutable: /sys/firmware/efi/efivars/KEK-...
You need to chattr -i files in efivarfs
```

`chattr -i` で属性を外す。PK が無い状態で `PK-*` を展開すると zsh が glob で止まるので、`sh` 経由で存在するファイルだけ処理した。

```bash
sudo sh -c 'for f in /sys/firmware/efi/efivars/PK-* /sys/firmware/efi/efivars/KEK-* /sys/firmware/efi/efivars/db-*; do [ -e "$f" ] && chattr -i "$f"; done'
sudo sbctl enroll-keys --microsoft
```

`--microsoft` を付けると Microsoft の証明書も一緒に入る。Windows Boot Manager と NVIDIA の Option ROM は Microsoft 署名なので、これを残さないと Windows や GPU が起動しなくなる。

## 最初の失敗

最初はこの順番を間違えた。OS Type を Windows UEFI mode にして Secure Boot を有効にしたら、起動時にこう出た。

```text
Secure Boot Violation
The system found unauthorized changes on the firmware, operating system or UEFI drivers.
```

BIOS で Secure Boot を無効に戻して調べると、ファームウェアの鍵が ASUS のファクトリー鍵に戻っていた。

```text
PK: ASUSTeK MotherBoard PK Certificate
DB: Microsoft ..., Canonical ...
```

sbctl の `Database Key` が DB から消えている。lanzaboote は sbctl の鍵で署名しているので、ファームウェアから見ると知らない署名ということになる。

`sbctl verify` は「ファイルに署名があるか」しか見ていない。ファームウェアがその鍵を信じているかは別の話で、`sbctl list-enrolled-keys` を見るまで気づかなかった。OS Type の変更や Secure Boot の有効化でファクトリー鍵が戻るボードでは、**PK と DB の中身まで確認する必要がある**。

## 成功した順番

最終的にうまくいったのは次の順番だった。

1. BIOS で OS Type を **Windows UEFI mode**、Secure Boot Mode を **Custom** にする
2. Key Management → **Clear Secure Boot keys** を実行
3. 保存して再起動
4. NixOS で `sudo sbctl status` が Setup Mode: Enabled になっていることを確認
5. `chattr -i` で efivar の immutable を外す
6. `sudo sbctl enroll-keys --microsoft`
7. `sudo sbctl list-enrolled-keys` で PK が `Platform Key`、DB に `Database Key` が入っていることを確認
8. 再起動
9. `sudo sbctl status` が Setup Mode: Disabled / Secure Boot: Enabled になる
10. BIOS の OS Type が Windows UEFI mode のままであることを確認して再起動

最後に確認する。

```bash
bootctl status | sed -n '1,12p'
sudo sbctl verify
```

`bootctl status` に `Secure Boot: enabled (user)` と出て、起動に使う EFI ファイルがすべて signed なら完了だ。Windows は F11 のブートメニューから起動できた。Windows の `msinfo32` を見れば「セキュアブートの状態」が On になっていることを確認できる。

## 残ったこと

`sbctl verify` には、古い systemd-boot のカーネルとフォールバックのバイナリが unsigned として残っている。lanzaboote の起動経路ではないので実害はない。気になるなら消してもいいが、`EFI/BOOT/BOOTX64.EFI` と `EFI/Linux/*.efi` は消してはいけない。

`/var/lib/sbctl` の鍵は失うと次のカーネル更新で署名できなくなる。暗号化したバックアップをどこかに置いておいた方がいい。BIOS 更新や CMOS クリアでも鍵が消えるので、そのときは同じ手順をやり直すことになる。

Windows が別ディスクにある構成だと、lanzaboote のメニューに Windows は出ない。F11 で選ぶか、Linux から `efibootmgr --bootnext` で次回起動先を Windows にするかのどちらかになる。今回は F11 で十分だった。

Secure Boot のために追加した設定はこれだけだが、ASUS のファクトリー鍵が戻る挙動と、Setup Mode の表示がすぐに更新されない挙動にかなり振り回された。同じボードでやるなら、OS Type を先に決める、`Install Default Secure Boot keys` を押さない、`sbctl list-enrolled-keys` で PK と DB を確認する、の 3 つを守ると迷わないはず。
