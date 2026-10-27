/**
 * ФОНОВАЯ МУЗЫКА — тихое «бархатное» фортепиано с реверберацией зала.
 * Свой трек: положите файл в media/music.mp3 и впишите путь в SITE.music (config.js) —
 * тогда вместо синтеза будет играть он (по кругу).
 */
window.IFMusic = (() => {
  const VOLUME = 0.13; // громкость синтезированного фортепиано: тихо, фоном
  const FILE_VOLUME = 0.03; // громкость трека из файла (SITE.music): очень тихо, фоном
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // Dmaj9 → Bm9 → Gmaj9 → Em9/A — мягкая «лаунж»-гармония
  const CHORDS = [
    [50, 54, 57, 61, 64],
    [47, 50, 54, 57, 61],
    [43, 47, 50, 54, 57],
    [45, 52, 55, 59, 62],
  ];
  const MELODY = [74, 76, 78, 81, 83, 86]; // ре-мажорная пентатоника
  const BAR = 4.8;

  let ctx = null;
  let master = null;
  let started = false;
  let audioEl = null;
  let endedCb = null;
  let ended = false; // трек доиграл (без повтора)
  let hasMedia = false; // к звуку подключено видео — контекст не усыпляем, чтобы видео не замирало

  function reverb() {
    const len = ctx.sampleRate * 3.6;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    return conv;
  }

  function build() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const src = window.SITE && window.SITE.music;
    if (src) {
      audioEl = new Audio(src);
      audioEl.loop = !!(window.SITE && window.SITE.musicLoop); // по умолчанию — один раз, без повтора
      audioEl.addEventListener('ended', () => {
        started = false;
        ended = true;
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(0, ctx.currentTime);
        if (endedCb) endedCb();
      });
      ctx.createMediaElementSource(audioEl).connect(master);
      return;
    }

    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 2200;
    const dry = ctx.createGain();
    dry.gain.value = 0.55;
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    const hall = reverb();
    tone.connect(dry).connect(master);
    tone.connect(hall).connect(wet).connect(master);

    // Нота «войлочного» фортепиано: основной тон + мягкие обертоны, быстрая атака, долгое затухание
    const note = (n, at, vel, len = 4.2) => {
      const f = midi(n);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vel, at + 0.012);
      g.gain.exponentialRampToValueAtTime(vel * 0.35, at + 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) pan.pan.value = Math.max(-0.6, Math.min(0.6, (n - 60) / 30));
      [[1, 1], [2, 0.22], [3, 0.06]].forEach(([h, a], k) => {
        const o = ctx.createOscillator();
        o.type = k ? 'sine' : 'triangle';
        o.frequency.value = f * h;
        o.detune.value = (Math.random() - 0.5) * 6;
        const og = ctx.createGain();
        og.gain.value = a;
        o.connect(og).connect(g);
        o.start(at);
        o.stop(at + len + 0.1);
      });
      if (pan) {
        g.connect(pan);
        pan.connect(tone);
      } else g.connect(tone);
    };

    // Тёплый пэд под аккордом
    const pad = (notes, at) => {
      notes.slice(0, 3).forEach((n) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = midi(n);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(0.018, at + 1.6);
        g.gain.setValueAtTime(0.018, at + BAR - 1);
        g.gain.linearRampToValueAtTime(0, at + BAR + 0.8);
        o.connect(g).connect(tone);
        o.start(at);
        o.stop(at + BAR + 1);
      });
    };

    let next = ctx.currentTime + 0.2;
    let bar = 0;
    const schedule = () => {
      while (next < ctx.currentTime + 2.5) {
        const chord = CHORDS[bar % CHORDS.length];
        note(chord[0] - 12, next, 0.11, 5.5); // бас
        chord.forEach((n, i) => note(n, next + 0.05 + i * 0.11 + Math.random() * 0.03, 0.05 + Math.random() * 0.015));
        pad(chord, next);
        // редкая мелодия сверху
        for (let b = 1.2; b < BAR; b += 1.2) {
          if (Math.random() < 0.42) note(MELODY[Math.floor(Math.random() * MELODY.length)], next + b + Math.random() * 0.15, 0.035, 3.6);
        }
        next += BAR;
        bar++;
      }
    };
    schedule();
    setInterval(schedule, 800);
  }

  return {
    /** Вызывать внутри нажатия пользователя: браузер разрешает звук только так. */
    unlock() {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
    },
    fadeIn(seconds = 4) {
      this.unlock();
      if (audioEl) {
        if (ended) audioEl.currentTime = 0; // доиграл — по кнопке начинаем сначала
        ended = false;
        audioEl.play().catch(() => {});
      }
      started = true;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(audioEl ? FILE_VOLUME : VOLUME, ctx.currentTime + seconds);
    },
    fadeOut(seconds = 0.8) {
      if (!ctx) return;
      started = false;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + seconds);
      setTimeout(() => {
        if (!started) {
          if (audioEl) audioEl.pause();
          if (!hasMedia) ctx.suspend();
        }
      }, seconds * 1000 + 100);
    },
    /**
     * Звук видео через свой регулятор громкости (на iPhone громкость <video> менять нельзя).
     * Возвращает { set(volume, seconds) }.
     */
    connectMedia(el) {
      this.unlock();
      const g = ctx.createGain();
      g.gain.value = 0;
      ctx.createMediaElementSource(el).connect(g).connect(ctx.destination);
      hasMedia = true;
      return {
        set(v, seconds = 1) {
          g.gain.cancelScheduledValues(ctx.currentTime);
          g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
          g.gain.linearRampToValueAtTime(v, ctx.currentTime + Math.max(0.05, seconds));
        },
      };
    },
    onEnded(cb) {
      endedCb = cb;
    },
    get ended() {
      return ended;
    },
    get playing() {
      return started;
    },
    get level() {
      return master ? master.gain.value : 0;
    },
    get state() {
      return ctx ? ctx.state : 'none';
    },
  };
})();
