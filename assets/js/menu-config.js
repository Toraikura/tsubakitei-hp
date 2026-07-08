/* microCMS Hobby用メニュー設定
 * enabledをtrueにするとmicroCMSを正本にします。
 * apiKeyはGET権限だけのキーを入れてください。WRITE権限は絶対に付けないでください。
 */
window.TSUBAKITEI_MENU_CMS = {
  enabled: true,
  serviceDomain: "tsubakitei-hp",
  endpoint: "menus",
  apiKey: "brnmMHIWz08CI25Z3AhCLywFSROA8AbKdsfq",
  queries: "limit=100&orders=sortOrder"
};
