/* Portfolio of Huzzatul Jannat Shethil — © Huzzatul Jannat Shethil, CSE, UIU · UI/UX Designer */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* theme */
  var tt = $('#themeToggle');
  if (tt) tt.addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('sh-theme', next); } catch (e) { /* storage unavailable */ }
  });

  /* mobile menu */
  var nav = $('#nav'), mb = $('#menuBtn');
  if (nav && mb) {
    mb.addEventListener('click', function () { mb.setAttribute('aria-expanded', nav.classList.toggle('open')); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
  }

  /* header, progress, back to top */
  var bar = $('.topbar'), prog = $('#progress'), up = $('#toTop');
  function onScroll() {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.classList.toggle('scrolled', y > 10);
    if (prog) prog.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    if (up) up.classList.toggle('show', y > 700);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (up) up.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* reveal on scroll */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

    /* scrollspy */
    var links = $$('.nav a[data-nav]');
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.dataset.nav === e.target.id); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) { var s = document.getElementById(a.dataset.nav); if (s) spy.observe(s); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* rotating word */
  var rot = $('#rotator');
  if (rot && !reduced) {
    var words = []; try { words = JSON.parse(rot.dataset.words); } catch (e) { }
    var wi = 0;
    setInterval(function () {
      wi = (wi + 1) % words.length;
      rot.innerHTML = '<span>' + words[wi] + '</span>';
    }, 2400);
  }

  /* multiplayer-style cursors wandering over the hero artwork */
  var art = $('.hero-art');
  if (art && !reduced) {
    var cursors = $$('.cursor', art);
    function wander() {
      var r = art.getBoundingClientRect();
      cursors.forEach(function (c) {
        var x = (Math.random() - .5) * r.width * .45, y = (Math.random() - .5) * r.height * .35;
        c.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)';
      });
    }
    wander(); setInterval(wander, 2600);

    /* subtle parallax on the photo frame */
    var frame = $('#frame');
    art.addEventListener('pointermove', function (e) {
      var r = art.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      frame.style.transform = 'perspective(900px) rotateY(' + (dx * 8).toFixed(2) + 'deg) rotateX(' + (-dy * 8).toFixed(2) + 'deg)';
    });
    art.addEventListener('pointerleave', function () { frame.style.transform = ''; });
  }
})();
