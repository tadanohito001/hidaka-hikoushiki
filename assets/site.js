/* 日高高校（非公式）共通の動き。T-20261008-19 */
(function () {
  'use strict';
  var root = document.documentElement;
  var THEME_KEY = 'hidaka-theme';

  /* ローカル（file://）で開いたとき、フォルダへのリンク（../clubs/ など）に index.html を足す。
     GitHub Pages では何もしないので、URL は /clubs/ のまま。 */
  if (location.protocol === 'file:') {
    [].forEach.call(document.querySelectorAll('a[href]'), function (a) {
      var h = a.getAttribute('href');
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(h)) return;
      var i = h.indexOf('#');
      var path = i < 0 ? h : h.slice(0, i);
      var hash = i < 0 ? '' : h.slice(i);
      if (path === '') return;
      if (path === '.' || path === '..') path += '/';
      if (/\/$/.test(path)) a.setAttribute('href', path + 'index.html' + hash);
    });
  }

  /* 明暗の切り替え（選んだ方を保存して、ほかのページでも同じにする） */
  var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
  [].forEach.call(document.querySelectorAll('.theme-btn'), function (b) {
    b.addEventListener('click', function () {
      var cur = root.getAttribute('data-theme');
      var dark = cur ? cur === 'dark' : mqDark.matches;
      var next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 保存できない環境では、そのページだけ切り替える */ }
    });
  });

  /* スマホのメニュー（ハンバーガー） */
  var menuBtn = document.querySelector('.menu-btn');
  var gnav = document.getElementById('gnav');
  if (menuBtn && gnav) {
    var setMenu = function (open) {
      gnav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.querySelector('.menu-label').textContent = open ? '閉じる' : 'メニュー';
    };
    menuBtn.addEventListener('click', function () { setMenu(!gnav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gnav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
    var mqWide = window.matchMedia('(min-width: 901px)');
    var onWide = function (e) { if (e.matches) setMenu(false); };
    if (mqWide.addEventListener) mqWide.addEventListener('change', onWide); else mqWide.addListener(onWide);
  }

  /* 部活動の絞り込みと検索（部活動のページだけ） */
  var q = document.getElementById('clubQ');
  if (q) {
    var cat = 'all';
    var catBtns = [].slice.call(document.querySelectorAll('.seg-btns button'));
    var clubs = [].slice.call(document.querySelectorAll('.club'));
    var groups = [].slice.call(document.querySelectorAll('.club-group'));
    var countEl = document.getElementById('clubCount');
    var emptyEl = document.getElementById('clubEmpty');
    var CATS = { sports: 1, culture: 1, other: 1 };
    var apply = function () {
      var words = q.value.trim().toLowerCase().split(/[\s　]+/).filter(Boolean);
      var shown = 0;
      clubs.forEach(function (c) {
        var text = c.textContent.toLowerCase();
        var ok = (cat === 'all' || c.getAttribute('data-cat') === cat) &&
          words.every(function (w) { return text.indexOf(w) !== -1; });
        c.hidden = !ok;
        if (ok) shown++;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('.club:not([hidden])'); });
      countEl.textContent = clubs.length + '件中' + shown + '件を表示';
      emptyEl.hidden = shown !== 0;
    };
    var setCat = function (c) {
      cat = c;
      catBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === c ? 'true' : 'false'); });
      apply();
    };
    catBtns.forEach(function (b) { b.addEventListener('click', function () { setCat(b.getAttribute('data-cat')); }); });
    q.addEventListener('input', apply);

    /* #sports などで開いたとき・押したときは、その種類に絞る */
    var fromHash = function () {
      var h = location.hash.slice(1);
      if (!CATS[h]) return;
      q.value = '';
      setCat(h);
      var el = document.getElementById(h);
      if (el) el.scrollIntoView();
    };
    [].forEach.call(document.querySelectorAll('a[data-club-filter]'), function (a) {
      a.addEventListener('click', function () {
        q.value = '';
        setCat(a.getAttribute('data-club-filter'));
      });
    });
    window.addEventListener('hashchange', fromHash);
    fromHash();
    apply();
  }
})();
