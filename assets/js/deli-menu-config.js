/* ツバキ&デリ用メニュー設定
 * enabledをtrueにするとmicroCMSのmenus APIから store=deli の品目を表示します。
 * apiKeyはmenus GETだけのキーを入れてください。
 */
window.TSUBAKITEI_DELI_MENU_CMS = {
  enabled: true,
  serviceDomain: "tsubakitei-hp",
  endpoint: "deli-menus",
  fallbackEndpoint: "menus",
  apiKey: "brnmMHIWz08CI25Z3AhCLywFSROA8AbKdsfq",
  queries: "limit=100&orders=sortOrder"
};
