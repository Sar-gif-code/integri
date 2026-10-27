(() => {
  const S = window.SITE;
  const T = window.TEXTS;
  const LANGS = ['ru', 'kz', 'en'];
  const HTML_LANG = { ru: 'ru', kz: 'kk', en: 'en' };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const wa = (text) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
  const icon = (id, size = 22) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><use href="#${id}"/></svg>`;

  function pickLang() {
    const q = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(q)) return q;
    const saved = store.get('lang');
    if (LANGS.includes(saved)) return saved;
    const nav = (navigator.language || 'ru').slice(0, 2).toLowerCase();
    if (nav === 'kk') return 'kz';
    if (nav === 'en') return 'en';
    return 'ru';
  }

  let lang = pickLang();
  let t = T[lang];

  // ---------- Списки ----------
  const WHAT_MEDIA = [
    '<img src="media/showreel-poster.jpg" alt="" loading="lazy">',
    '<div class="art art-cartoon"><i></i><i></i><i></i></div>',
    '<div class="art art-tale"><b></b><i></i><i></i><i></i><i></i><i></i></div>',
    '<img src="media/arrival-window.jpg" alt="" loading="lazy">',
  ];
  const PLAN_TYPES = ['greeting', 'tale', 'film'];

  const lists = {
    what: () =>
      t.what.items
        .map(
          ([title, text], i) => `
        <article class="card" data-reveal style="--d:${i}">
          <div class="card-media zoom">${WHAT_MEDIA[i]}</div>
          <div class="card-body">
            <span class="card-num">0${i + 1}</span>
            <h3>${esc(title)}</h3>
            <p>${esc(text)}</p>
          </div>
        </article>`
        )
        .join(''),

    how: () =>
      t.how.steps
        .map(
          ([title, text], i) => `
        <li class="step" data-reveal style="--d:${i}">
          <span class="step-num">${i + 1}</span>
          <h3>${esc(title)}</h3>
          <p>${esc(text)}</p>
        </li>`
        )
        .join(''),

    works: () =>
      S.works
        .map(
          (w, i) => `
        <button class="work${w.wide ? ' work-wide' : ''}" type="button" data-video="${esc(w.video)}" data-reveal style="--d:${i}">
          <div class="work-media zoom"><img src="${esc(w.poster)}" alt="" loading="lazy"></div>
          <span class="work-play">${icon('i-play', 26)}</span>
          <span class="work-info">
            <small>${esc(t.portfolio.types[w.type] || '')}</small>
            <strong>${esc(t.portfolio.works[w.title] || w.title)}</strong>
          </span>
        </button>`
        )
        .join('') +
      `<a class="work work-yours" href="#order" data-reveal style="--d:${S.works.length}">
          <span class="work-yours-in">
            <strong>${esc(t.portfolio.yours)}</strong>
            <span class="link">${esc(t.portfolio.yoursCta)} →</span>
          </span>
        </a>`,

    plans: () =>
      t.prices.plans
        .map((p, i) => {
          const type = PLAN_TYPES[i];
          const price = S.prices[type];
          return `
        <article class="plan${i === 1 ? ' plan-top' : ''}" data-reveal style="--d:${i}">
          ${i === 1 ? `<span class="plan-badge">${esc(t.prices.popular)}</span>` : ''}
          <h3>${esc(p.name)}</h3>
          <p class="plan-len">${esc(p.length)}</p>
          <p class="plan-price${price ? '' : ' plan-price-req'}">${esc(price || t.prices.onRequest)}</p>
          <ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
          <a class="btn${i === 1 ? '' : ' btn-ghost'} btn-wide" href="#order" data-type="${type}">${esc(t.prices.cta)}</a>
        </article>`;
        })
        .join(''),

    reviews: () =>
      S.reviews.length
        ? S.reviews
            .map(
              (r, i) => `
        <figure class="review" data-reveal style="--d:${i}">
          ${r.photo ? `<img src="${esc(r.photo)}" alt="" loading="lazy">` : ''}
          <blockquote>${esc(r.text)}</blockquote>
          <figcaption>${esc(r.name)}${r.city ? ` · ${esc(r.city)}` : ''}</figcaption>
        </figure>`
            )
            .join('')
        : `<figure class="review review-empty" data-reveal><span class="quote">“</span><blockquote>${esc(t.reviews.empty)}</blockquote></figure>`,

    founder: () => t.founder.text.map((p, i) => `<p class="lead" data-reveal style="--d:${i}">${esc(p)}</p>`).join(''),

    faq: () =>
      t.faq.items
        .map(
          ([q, a], i) => `
        <div class="qa" data-reveal style="--d:${i}">
          <button type="button" aria-expanded="false" aria-controls="qa-${i}">${esc(q)}<i></i></button>
          <div class="qa-a" id="qa-${i}"><div><p>${esc(a)}</p></div></div>
        </div>`
        )
        .join(''),

    types: () =>
      `<option value="">${esc(t.form.typeChoose)}</option>` +
      Object.entries(t.form.types)
        .map(([k, v]) => `<option value="${k}">${esc(v)}</option>`)
        .join(''),
  };

  // ---------- Рендер ----------
  function render() {
    t = T[lang];
    document.documentElement.lang = HTML_LANG[lang];
    document.title = t.meta.title;
    $('meta[name="description"]').content = t.meta.description;

    $$('[data-t]').forEach((el) => (el.textContent = get(t, el.dataset.t) ?? ''));
    $$('[data-t-html]').forEach((el) => (el.innerHTML = get(t, el.dataset.tHtml) ?? ''));
    $$('[data-ph]').forEach((el) => (el.placeholder = get(t, el.dataset.ph) ?? ''));
    $$('[data-t-aria]').forEach((el) => el.setAttribute('aria-label', get(t, el.dataset.tAria) ?? ''));

    const form = $('#form');
    const keepType = form.type.value;
    $$('[data-list]').forEach((el) => (el.innerHTML = lists[el.dataset.list]()));
    form.type.value = keepType;
    updatePhotosLabel();

    $$('[data-lang-switch]').forEach(
      (el) =>
        (el.innerHTML = LANGS.map(
          (l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}">${l.toUpperCase()}</button>`
        ).join('<span>/</span>'))
    );

    $$('[data-wa]').forEach((el) => (el.href = wa(t.wa[el.dataset.wa])));

    const socials = [
      S.whatsapp && { href: wa(t.wa.default), icon: 'i-wa', label: 'WhatsApp' },
      S.telegram && { href: S.telegram, icon: 'i-tg', label: 'Telegram' },
      S.instagram && { href: S.instagram, icon: 'i-ig', label: 'Instagram' },
      S.email && { href: `mailto:${S.email}`, icon: 'i-mail', label: S.email },
    ].filter(Boolean);
    $('[data-socials]').innerHTML = socials
      .map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noopener">${icon(s.icon)}<span>${esc(s.label)}</span></a>`)
      .join('');

    $('[data-rights]').textContent = t.footer.rights.replace('{y}', new Date().getFullYear());

    setMusicBtn(M.playing);

    if (S.founderPhoto) $('[data-founder-photo]').innerHTML = `<img src="${esc(S.founderPhoto)}" alt="${esc(t.founder.title)}">`;

    observeReveals();
  }

  // ---------- Появление при прокрутке ----------
  const io =
    'IntersectionObserver' in window && !reduced
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('in');
                io.unobserve(e.target);
              }
            }),
          { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
        )
      : null;

  function observeReveals() {
    $$('[data-reveal]:not(.in)').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));
  }

  // ---------- Параллакс и шапка ----------
  let ticking = false;
  const header = $('.header');
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header.classList.toggle('scrolled', y > 40);
      if (!reduced) {
        $$('[data-parallax]').forEach((el) => {
          const k = parseFloat(el.dataset.parallax);
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > innerHeight + 200) return;
          const center = r.top + r.height / 2 - innerHeight / 2;
          const shift = el.classList.contains('hero-media') ? y * k : center * k;
          el.style.setProperty('--py', `${shift.toFixed(1)}px`);
        });
      }
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // ---------- Клики ----------
  const nav = $('#nav');
  const burger = $('.burger');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? t.nav.close : t.nav.menu);
    document.body.classList.toggle('menu-open', open);
  };

  document.addEventListener('click', (e) => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
      lang = langBtn.dataset.lang;
      store.set('lang', lang);
      const u = new URL(location.href);
      u.searchParams.set('lang', lang);
      history.replaceState(null, '', u);
      render();
      return;
    }
    if (e.target.closest('.burger')) return setMenu(!nav.classList.contains('open'));
    if (e.target.closest('.nav a')) setMenu(false);

    const typed = e.target.closest('[data-type]');
    if (typed) $('#form').type.value = typed.dataset.type;

    const work = e.target.closest('[data-video]');
    if (work) openModal(work.dataset.video);

    const qa = e.target.closest('.qa button');
    if (qa) {
      const open = qa.getAttribute('aria-expanded') !== 'true';
      qa.setAttribute('aria-expanded', open);
      qa.parentElement.classList.toggle('open', open);
    }
  });

  // ---------- Модальное окно с видео ----------
  const modal = $('#modal');
  const mv = $('.modal-video');
  function openModal(src) {
    pauseMusicForPage();
    mv.src = src;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('show'));
    document.body.classList.add('lock');
    mv.play().catch(() => {});
    $('.modal-close').focus();
  }
  function closeModal() {
    modal.classList.remove('show');
    mv.pause();
    resumeMusicForPage();
    document.body.classList.remove('lock');
    setTimeout(() => {
      modal.hidden = true;
      mv.removeAttribute('src');
      mv.load();
    }, 400);
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('.modal-close')) closeModal();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      setMenu(false);
    }
  });

  // ---------- Форма ----------
  const form = $('#form');
  let photoCount = 0;
  function updatePhotosLabel() {
    const label = $('[data-photos-label]');
    label.textContent = photoCount ? t.form.photosCount.replace('{n}', photoCount) : t.form.photosBtn;
  }
  form.date.min = new Date().toISOString().slice(0, 10);
  form.photos.addEventListener('change', () => {
    const files = [...form.photos.files].slice(0, 12);
    photoCount = form.photos.files.length;
    const box = $('[data-thumbs]');
    box.querySelectorAll('img').forEach((img) => URL.revokeObjectURL(img.src));
    box.innerHTML = files.map((f) => `<img src="${URL.createObjectURL(f)}" alt="">`).join('');
    updatePhotosLabel();
  });
  form.addEventListener('input', (e) => e.target.closest('.field')?.classList.remove('invalid'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = null;
    ['name', 'phone'].forEach((k) => {
      const ok = form[k].value.trim().length > (k === 'phone' ? 5 : 0);
      form[k].closest('.field').classList.toggle('invalid', !ok);
      if (!ok && !bad) bad = form[k];
    });
    if (bad) return bad.focus();

    const w = t.wa;
    const v = (k) => form[k].value.trim();
    const dateStr = v('date') ? new Date(`${v('date')}T12:00`).toLocaleDateString(HTML_LANG[lang]) : '';
    const fields = [
      `${w.name}: ${v('name')}`,
      `${w.phone}: ${v('phone')}`,
      v('type') && `${w.type}: ${t.form.types[v('type')]}`,
      v('occasion') && `${w.occasion}: ${v('occasion')}`,
      dateStr && `${w.date}: ${dateStr}`,
      v('idea') && `${w.idea}: ${v('idea')}`,
      photoCount && w.photos.replace('{n}', photoCount),
    ].filter(Boolean);
    window.open(wa([w.head, '', ...fields].join('\n')), '_blank', 'noopener');
    $('[data-success]').hidden = false;
  });

  // ---------- Фоновая музыка ----------
  // Играет по умолчанию; если человек её выключил — запоминаем и больше не включаем сами.
  const M = window.IFMusic;
  const musicBtn = $('.music');
  let musicWanted = store.get('music') !== 'off';
  let musicPausedByPage = false;

  function setMusicBtn(on) {
    musicBtn.setAttribute('aria-pressed', on);
    musicBtn.classList.toggle('on', on);
    const label = on ? t.music.off : t.music.on;
    musicBtn.setAttribute('aria-label', label);
    musicBtn.title = label;
  }
  // Звук видео на главном экране: тихо и только пока экран виден; выключается той же кнопкой
  const HERO_VOLUME = 0; // 0 — видео без своего звука (играет только музыка); например 0.12 — тихо со звуком
  const heroVideo = $('.hero-video');
  let heroAudio = null;
  let heroInView = true;
  function updateHeroSound(seconds = 1.5) {
    if (!heroAudio) return;
    heroAudio.set(M.playing && heroInView ? HERO_VOLUME : 0, seconds);
  }
  if ('IntersectionObserver' in window)
    new IntersectionObserver(([e]) => {
      heroInView = e.isIntersecting;
      updateHeroSound(1.2);
    }, { threshold: 0.3 }).observe($('.hero'));

  function playMusic(seconds) {
    M.fadeIn(seconds);
    if (HERO_VOLUME && !heroAudio) {
      heroAudio = M.connectMedia(heroVideo);
      heroVideo.muted = false;
    }
    updateHeroSound(seconds);
    setMusicBtn(true);
  }
  function stopMusic(seconds) {
    M.fadeOut(seconds);
    updateHeroSound(seconds);
    setMusicBtn(false);
  }
  function showMusicButton() {
    musicBtn.hidden = false;
    requestAnimationFrame(() => musicBtn.classList.add('show'));
  }
  // Мелодия доиграла до конца — сама затихает, кнопка показывает «выключено» (нажатие сыграет заново)
  M.onEnded(() => {
    musicPausedByPage = false;
    setMusicBtn(false);
  });
  let gestureArmed = false;
  function disarmGesture() {
    gestureArmed = false;
    ['pointerdown', 'keydown'].forEach((ev) => removeEventListener(ev, onFirstGesture, true));
  }
  // Кнопка — единственный переключатель: играет → выключить; молчит → включить
  musicBtn.addEventListener('click', () => {
    disarmGesture();
    if (M.playing || musicPausedByPage) {
      musicPausedByPage = false;
      stopMusic(0.6);
      musicWanted = false;
      store.set('music', 'off');
    } else {
      musicWanted = true;
      store.set('music', 'on');
      playMusic(1.5);
    }
  });
  // Если заставку уже видели, звук можно включить только после первого касания страницы
  function onFirstGesture(e) {
    if (e.target.closest && e.target.closest('.music')) return; // кнопку обработает её собственный клик
    disarmGesture();
    if (musicWanted && !M.playing && !M.ended) playMusic(3);
  }
  function armMusicOnGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    ['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, onFirstGesture, true));
  }
  // Пауза, когда вкладка скрыта или открыто видео из портфолио
  function pauseMusicForPage() {
    if (M.playing) {
      musicPausedByPage = true;
      M.fadeOut(0.6);
      updateHeroSound(0.6);
    }
  }
  function resumeMusicForPage() {
    if (musicPausedByPage && musicWanted && !M.ended) {
      M.fadeIn(2);
      updateHeroSound(2);
    }
    musicPausedByPage = false;
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? pauseMusicForPage() : resumeMusicForPage()));

  // ---------- Заставка: занавес → видео со звуком → сайт ----------
  // Звук браузеры разрешают только после нажатия, поэтому сначала «Нажмите, чтобы открыть».
  function raiseCurtain() {
    const curtain = $('.curtain');
    const video = $('.intro-video', curtain);
    const body = document.body;
    // ?intro в адресе — показать заставку всегда (удобно для проверки)
    let seen = false;
    try { seen = sessionStorage.getItem('intro') === '1'; } catch {}
    if (new URLSearchParams(location.search).has('intro')) seen = false;
    if (reduced || seen) {
      curtain.remove();
      body.classList.add('ready');
      showMusicButton();
      armMusicOnGesture();
      return;
    }
    body.classList.add('lock');
    setTimeout(() => curtain.classList.add('waiting'), 900);

    // Растворение: видео продолжает идти, звук затихает, сквозь него проявляется сайт
    const FADE = 2400;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem('intro', '1'); } catch {}
      curtain.classList.add('done');
      body.classList.remove('lock');
      const v0 = video.volume;
      const t0 = performance.now();
      const fadeSound = (now) => {
        const k = Math.min(1, (now - t0) / (FADE - 200));
        video.volume = v0 * (1 - k) * (1 - k);
        if (k < 1) requestAnimationFrame(fadeSound);
      };
      requestAnimationFrame(fadeSound);
      // Музыка мягко входит, пока затихает звук заставки
      if (musicWanted) playMusic(4.5);
      showMusicButton();
      setTimeout(() => body.classList.add('ready'), 500);
      setTimeout(() => {
        video.pause();
        curtain.remove();
      }, FADE + 100);
    };
    // Начинаем растворение чуть раньше конца ролика, чтобы не было застывшего последнего кадра
    video.addEventListener('timeupdate', () => {
      if (video.duration && video.duration - video.currentTime < 1.5) finish();
    });

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      curtain.classList.remove('waiting');
      curtain.classList.add('playing');
      body.classList.add('curtain-open');
      if (musicWanted) M.unlock(); // звук разрешён только внутри нажатия — готовим музыку заранее
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(finish);
      });
    };

    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);
    $('.intro-skip', curtain).addEventListener('click', (e) => {
      e.stopPropagation();
      finish();
    });
    curtain.addEventListener('click', start);
    addEventListener('keydown', (e) => {
      if (finished) return;
      if (e.key === 'Escape') finish();
      else if (e.key === 'Enter' || e.key === ' ') start();
    });
  }

  render();
  onScroll();
  raiseCurtain();
})();
