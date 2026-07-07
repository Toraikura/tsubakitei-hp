/* ツバキ&デリ用メニュー設定
 * enabledをtrueにするとmicroCMSのmenus APIから store=deli の品目を表示します。
 * apiKeyはmenus GETだけのキーを入れてください。
 */
window.TSUBAKITEI_DELI_MENU_CMS = {
  enabled: false,
  serviceDomain: "",
  endpoint: "menus",
  apiKey: "",
  queries: "limit=100&orders=sortOrder"
};
