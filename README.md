# ツバキ亭HP（tsubakitei.tokyo）

東京・荻窪の洋食店「ツバキ亭」の公式サイト。Wixから移行した静的HTMLサイト。

## 構成

- **静的HTML/CSS/JS**（ビルド不要・フレームワークなし）
- ホスティング: GitHub Pages
- メニューデータ: `data/menu.json`（Phase 2でmicroCMSに切替予定 → `assets/js/menu.js` の `DATA_URL` を変更するだけ）

## ディレクトリ

```
index.html        トップ（店舗カード3枚）
home/             お知らせ
about/            ツバキ亭について
menu/             メニュー（menu.jsonから描画）
takeout/          テイクアウト
gallery/          ギャラリー
access/           アクセス
reserve/          ご予約
recruit/          採用情報
deli/             2号店ツバキ&デリ（★非公開: navから未リンク・noindex）
assets/           css / js / img
data/menu.json    メニューデータ（店主編集対象 → 将来microCMS）
docs/             設計書
```

## 運用メモ

- **2号店（/deli/）の公開手順**: ① `index.html` の2枚目のComing soonカードを `<a class="store-card" href="deli/">` に差し替え ② `deli/index.html` から `<meta name="robots" content="noindex, nofollow">` を削除
- 3号店追加時は `/店舗名/` ディレクトリを同パターンで追加
- メニュー変更は `data/menu.json` を編集（microCMS移行後は店主がスマホで編集）
- ローカル確認: `python3 -m http.server 8000` → http://localhost:8000

## ドメイン切替（未実施）

Wixダッシュボード「DNSレコードを管理」で tsubakitei.tokyo をGitHub Pagesに向ける。手順は `docs/superpowers/specs/2026-07-07-tsubakitei-hp-design.md` 参照。
