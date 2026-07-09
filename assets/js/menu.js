/* メニュー描画
 * microCMS設定がある場合はCMSを正本にする。
 * 未設定/取得失敗時は ../data/menu.json にfallbackする。
 */
(function () {
  var LOCAL_DATA_URL = "../data/menu.json";
  var LABELS = { "menu": "Lunch", "dinner-menu": "Dinner", "course-menu": "Course" };
  var MENU_ORDER = ["menu", "dinner-menu", "course-menu"];
  var CMS_CONFIG = window.TSUBAKITEI_MENU_CMS || {};

  var tabsEl = document.getElementById("menu-tabs");
  var leadEl = document.getElementById("menu-lead");
  var bodyEl = document.getElementById("menu-body");

  function yen(n) {
    return "￥" + Number(n).toLocaleString("ja-JP");
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function imageSrc(src) {
    if (!src) return "";
    if (/^(https?:)?\/\//.test(src) || src.charAt(0) === "/") return src;
    return "../" + src;
  }

  function priceHtml(item) {
    if (item.priceText) return esc(item.priceText);
    if (item.variants && item.variants.length) {
      return item.variants
        .map(function (v) { return "<small>" + esc(v.name) + "</small> " + yen(v.price); })
        .join(" / ");
    }
    if (item.price && item.price > 0) return yen(item.price);
    return "";
  }

  function render(menu) {
    leadEl.textContent = (menu.description || "").trim();
    var html = "";
    menu.sections.forEach(function (sec) {
      if (!sec.items.length && !sec.description) return;
      html += '<div class="menu-section"><h3>' + esc(sec.name) + "</h3>";
      if (sec.description) html += '<p class="sec-desc">' + esc(sec.description) + "</p>";
      if (sec.items.length) {
        html += '<div class="menu-items">';
        sec.items.forEach(function (item) {
          html += '<div class="menu-item">';
          if (item.image) html += '<img class="thumb" src="' + esc(imageSrc(item.image)) + '" alt="' + esc(item.name) + '" loading="lazy">';
          html += '<div class="body"><div class="name">' + esc(item.name) + "</div>";
          if (item.description) html += '<div class="desc">' + esc(item.description) + "</div>";
          html += "</div>";
          var p = priceHtml(item);
          if (p) html += '<div class="price">' + p + "</div>";
          html += "</div>";
        });
        html += "</div>";
      }
      html += "</div>";
    });
    bodyEl.innerHTML = html;
  }

  function fetchJson(url, options) {
    return fetch(url, options || {}).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function selectedValue(value) {
    return Array.isArray(value) ? value[0] : value;
  }

  function normalizeMenuId(value) {
    value = selectedValue(value);
    var v = String(value || "").trim();
    if (v === "Lunch" || v === "lunch") return "menu";
    if (v === "ランチ" || v === "ランチメニュー" || v === "Lunch Menu") return "menu";
    if (v === "Dinner" || v === "dinner") return "dinner-menu";
    if (v === "ディナー" || v === "ディナーメニュー" || v === "Dinner Menu") return "dinner-menu";
    if (v === "Course" || v === "course") return "course-menu";
    if (v === "コース" || v === "コースメニュー" || v === "Course Menu") return "course-menu";
    return v || "menu";
  }

  function normalizeStore(value) {
    value = selectedValue(value);
    var v = String(value || "").trim();
    if (v === "tsubakitei" || v === "ツバキ亭" || v === "洋食ツバキ亭" || v === "本店") return "tsubakitei";
    if (v === "deli" || v === "Deli" || v === "デリ" || v === "ツバキ&デリ") return "deli";
    return "";
  }

  function getImageUrl(image) {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.url || "";
  }

  function numberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    var n = Number(value);
    return isNaN(n) ? null : n;
  }

  function sortByOrder(a, b) {
    return (numberOrNull(a.sortOrder) || 0) - (numberOrNull(b.sortOrder) || 0);
  }

  function microCmsToMenus(data) {
    var menusById = {};
    MENU_ORDER.forEach(function (id) {
      menusById[id] = { id: id, name: LABELS[id], description: "", sections: [] };
    });

    (data.contents || []).filter(function (row) {
      var store = row.storeSingle || row.storeSelect || row.store;
      return row.visible !== false && (!store || normalizeStore(store) === "tsubakitei");
    }).sort(sortByOrder).forEach(function (row) {
      var menuId = normalizeMenuId(row.menuIdSingle || row.menuIdSelect || row.menuId || row.menu);
      var menu = menusById[menuId] || (menusById[menuId] = {
        id: menuId,
        name: row.menuLabel || LABELS[menuId] || menuId,
        description: "",
        sections: []
      });
      if (!menu.description && row.menuDescription) menu.description = row.menuDescription;

      var sectionName = selectedValue(row.sectionNameSingle) || selectedValue(row.sectionNameSelect) || selectedValue(row.sectionName) || "その他";
      var sectionDescription = row.sectionDescription || "";
      var itemDescription = row.description || "";
      if (menuId === "course-menu" && sectionName === "コース料理" && !itemDescription) {
        var priceDescriptionIndex = sectionDescription.indexOf("(税込");
        if (priceDescriptionIndex >= 0) {
          itemDescription = sectionDescription.slice(priceDescriptionIndex).trim();
          sectionDescription = sectionDescription.slice(0, priceDescriptionIndex).trim();
        }
      }
      var section = menu.sections.filter(function (sec) { return sec.name === sectionName; })[0];
      if (!section) {
        section = { name: sectionName, description: sectionDescription, items: [] };
        menu.sections.push(section);
      }
      if (!section.description && sectionDescription) section.description = sectionDescription;

      var image = getImageUrl(row.image) || row.imagePath || "";
      var price = numberOrNull(row.price);
      var hasItem = !!(row.name || row.description || price || row.priceText || image);
      if (hasItem) {
        section.items.push({
          name: row.name || "",
          description: itemDescription,
          price: price,
          priceText: row.priceText || "",
          image: image,
          sortOrder: row.sortOrder
        });
      }
    });

    return {
      menus: MENU_ORDER.map(function (id) { return menusById[id]; })
        .filter(function (menu) { return menu.sections.length; })
    };
  }

  function microCmsUrl() {
    return microCmsUrlFor(CMS_CONFIG.endpoint);
  }

  function microCmsUrlFor(endpoint) {
    var queries = CMS_CONFIG.queries || "limit=100&orders=sortOrder";
    return "https://" + CMS_CONFIG.serviceDomain + ".microcms.io/api/v1/" + endpoint + "?" + queries;
  }

  function fetchLegacyMenu() {
    return fetchJson(microCmsUrlFor(CMS_CONFIG.fallbackEndpoint), {
      cache: "no-cache",
      headers: { "X-MICROCMS-API-KEY": CMS_CONFIG.apiKey }
    });
  }

  function loadMenuData() {
    if (CMS_CONFIG.enabled && CMS_CONFIG.serviceDomain && CMS_CONFIG.endpoint && CMS_CONFIG.apiKey) {
      return fetchJson(microCmsUrl(), {
        cache: "no-cache",
        headers: { "X-MICROCMS-API-KEY": CMS_CONFIG.apiKey }
      }).then(function (data) {
        if (CMS_CONFIG.fallbackEndpoint && (!data.contents || !data.contents.length)) {
          console.warn("microCMS split menu is empty. Fallback to legacy endpoint.");
          return fetchLegacyMenu();
        }
        return data;
      }).catch(function (e) {
        if (!CMS_CONFIG.fallbackEndpoint) throw e;
        console.warn("microCMS split menu load failed. Fallback to legacy endpoint.", e);
        return fetchLegacyMenu();
      }).then(microCmsToMenus).catch(function (e) {
        console.warn("microCMS menu load failed. Fallback to local JSON.", e);
        return fetchJson(LOCAL_DATA_URL, { cache: "no-cache" });
      });
    }
    return fetchJson(LOCAL_DATA_URL, { cache: "no-cache" });
  }

  function renderTabs(menus) {
    tabsEl.innerHTML = "";
    menus.forEach(function (menu, i) {
      var btn = document.createElement("button");
      btn.className = "menu-tab" + (i === 0 ? " active" : "");
      btn.textContent = LABELS[menu.id] || menu.name;
      btn.addEventListener("click", function () {
        tabsEl.querySelectorAll(".menu-tab").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        render(menu);
      });
      tabsEl.appendChild(btn);
    });
    if (menus.length) render(menus[0]);
  }

  loadMenuData()
    .then(function (data) { renderTabs(data.menus || []); })
    .catch(function (e) {
      bodyEl.innerHTML = '<p style="text-align:center">メニューを読み込めませんでした。お手数ですが再読み込みしてください。</p>';
      console.error(e);
    });
})();
