# microCMS Hobby メニュー更新設計

目的: microCMS Hobby 0円枠のまま、店主がスマホからメニューの金額と写真を変更できるようにする。

## コスト方針

- GitHub Pages: 0円
- microCMS Hobby: 0円/月
- Wix: ドメイン契約のみ維持
- microCMS Teamには上げない前提。必要になった場合は店側の月額保守費に含めるか、機能をHobby内に戻す。

## microCMS API

API名: `メニュー`

エンドポイント: `menus`

形式: リスト形式

API数を節約するため、ランチ/ディナー/コースを分けずに `menus` 1本で管理する。

ツバキ亭本店とツバキ&デリを同じ `menus` APIで管理し、`store` で出し分ける。

## フィールド

| 表示名 | フィールドID | 種類 | 店主が触る | 用途 |
|---|---|---|---|---|
| 表示する | `visible` | 真偽値 | ○ | 一時的に非表示にする |
| 店舗 | `store` | テキスト | - | `tsubakitei` 固定 |
| メニュー区分 | `menuId` | セレクト | - | `menu` / `dinner-menu` / `course-menu` / `deli` |
| セクション名 | `sectionName` | テキスト | - | ランチメニュー、単品など |
| セクション説明 | `sectionDescription` | テキストエリア | - | 注意書き |
| 並び順 | `sortOrder` | 数字 | - | 表示順 |
| 品名 | `name` | テキスト | △ | 基本は触らない |
| 説明 | `description` | テキストエリア | △ | 補足文 |
| 金額 | `price` | 数字 | ○ | 単一価格の税込金額 |
| 金額表示 | `priceText` | テキスト | ○ | S/L価格など。入力時は `price` より優先 |
| 既存写真パス | `imagePath` | テキスト | - | 初回移行用のローカル画像パス |
| 写真 | `image` | 画像 | ○ | 店主が差し替えるメニュー写真 |

店主向けには `金額`、`金額表示`、`写真`、`表示する` だけを案内する。`sortOrder` や `menuId` は初期設定後に触らない。

`image` が入っている場合は `image` を優先表示する。`image` が空の場合は `imagePath` の既存画像を表示する。

ツバキ&デリは `store: deli` の20枠を先に作っておく。不要な枠は `表示する` をOFFにするだけで非表示にできる。

## 金額入力ルール

- 単一価格: `price` に `1200` のように数字だけ入力する
- S/Lなど複数価格: `priceText` に `S ￥650 / L ￥750` のように表示したい文字を入れる
- `priceText` が入っている場合は、サイトでは `priceText` を優先表示する

## サイト側設定

`assets/js/menu-config.js` の値を入れる。

```js
window.TSUBAKITEI_MENU_CMS = {
  enabled: true,
  serviceDomain: "サービスID",
  endpoint: "menus",
  apiKey: "GET専用APIキー",
  queries: "limit=100&orders=sortOrder"
};
```

注意: `apiKey` はGET権限だけにする。WRITE権限付きキーはブラウザに置かない。また、個別権限で `menus` エンドポイントだけ読めるキーにする。

## fallback

microCMSが未設定、または取得に失敗した場合は `data/menu.json` を読む。これにより本番中にCMS側で一時障害があっても、既存メニュー表示は維持される。

## 初回移行手順

1. microCMS Hobbyでサービスを作成
2. リスト形式API `menus` を作成
3. 上記フィールドを作成
4. `node scripts/build-microcms-menu-import.mjs` で `data/microcms-menu-import.csv` を生成
5. `menus` APIの「インポートする」からCSVを読み込む
6. GET専用APIキーを作成。個別権限で `menus` のGETだけ許可する
7. `assets/js/menu-config.js` に接続情報を入力し、`enabled: true` にする
8. ローカルとGitHub Pagesでメニュー表示を確認

## CSVインポート時の注意

microCMSのCSVインポートでは、画像フィールドに入れられるのはmicroCMSで配信されている画像URLのみ。既存のローカル画像は `imagePath` に入れておき、店主が写真を差し替える時に `image` フィールドへアップロードする。

`data/microcms-menu-import.csv` には本店59品目 + ツバキ&デリ20枠が入る。

## 店主への説明文

「メニューの金額や写真を変える時は、microCMSのメニュー画面を開いて、該当する品目の `金額` または `金額表示` と `写真` だけ変更してください。保存するとホームページのPC表示・スマホ表示の両方に反映されます。」
