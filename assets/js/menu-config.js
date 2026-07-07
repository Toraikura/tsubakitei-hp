/* microCMS Hobby用メニュー設定
 * enabledをtrueにするとmicroCMSを正本にします。
 * apiKeyはGET権限だけのキーを入れてください。WRITE権限は絶対に付けないでください。
 */
window.TSUBAKITEI_MENU_CMS = {
  enabled: false,
  serviceDomain: "",
  endpoint: "menus",
  apiKey: "",
  queries: "limit=100&orders=sortOrder"
};
