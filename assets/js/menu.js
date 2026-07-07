/* メニュー描画
 * Phase 1: ../data/menu.json から読み込み
 * Phase 2: microCMS導入時は DATA_URL をmicroCMSのAPIに切り替える
 */
(function () {
  var DATA_URL = "../data/menu.json";
  var LABELS = { "menu": "Lunch", "dinner-menu": "Dinner", "course-menu": "Course" };

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

  function priceHtml(item) {
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
          if (item.image) html += '<img class="thumb" src="../' + esc(item.image) + '" alt="' + esc(item.name) + '" loading="lazy">';
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

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var menus = data.menus;
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
    })
    .catch(function (e) {
      bodyEl.innerHTML = '<p style="text-align:center">メニューを読み込めませんでした。お手数ですが再読み込みしてください。</p>';
      console.error(e);
    });
})();
