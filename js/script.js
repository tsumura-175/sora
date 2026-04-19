/* =============================================================
   はじまりの家そら｜TOPページ Scripts (PlanA v5)
   - スクロール検知（ヘッダー白化・KVパララックス）
   - IntersectionObserver（フェードアップ・Numbersカウントアップ）
   - KVスライダー（2枚クロスフェード）
   - オーバーレイメニュー（focus trap, ESC）
   - お問い合わせフォーム（honeypot + time-trap + 簡易バリデーション）
   - tel: リンクのJS難読化解除
   ============================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -----------------------------------------------------------
  // 1. ヘッダー白化（スクロール80px超）
  // -----------------------------------------------------------
  const header = document.getElementById('siteHeader');
  let lastScroll = 0;
  let scrollTicking = false;

  const updateHeader = () => {
    if (lastScroll > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    lastScroll = window.scrollY;
    if (!scrollTicking) {
      window.requestAnimationFrame(updateHeader);
      scrollTicking = true;
    }
  }, { passive: true });
  updateHeader();

  // -----------------------------------------------------------
  // 2. オーバーレイメニュー
  // -----------------------------------------------------------
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlayMenu');
  const focusableSel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const openMenu = () => {
    lastFocused = document.activeElement;
    document.body.classList.add('menu-open');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    document.body.style.overflow = 'hidden';
    // フォーカスを最初のリンクへ
    const first = overlay.querySelector(focusableSel);
    if (first) setTimeout(() => first.focus(), 400);
  };

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  hamburger.addEventListener('click', () => {
    if (overlay.classList.contains('is-open')) closeMenu(); else openMenu();
  });

  // 閉じるボタン（×）
  const overlayCloseBtn = document.getElementById('overlayClose');
  if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener('click', closeMenu);
  }

  // ESC で閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
  });

  // メニュー内リンククリックで自動的に閉じる（同ページ内アンカーへの遷移）
  overlay.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', () => {
      if (overlay.classList.contains('is-open')) closeMenu();
    });
  });

  // focus trap
  overlay.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !overlay.classList.contains('is-open')) return;
    const focusable = Array.from(overlay.querySelectorAll(focusableSel));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });

  // -----------------------------------------------------------
  // 3. KVスライダー（2枚クロスフェード）
  // -----------------------------------------------------------
  const slider = document.querySelector('[data-kv-slider]');
  if (slider && !reduceMotion) {
    const slides = Array.from(slider.querySelectorAll('.kv__img'));
    if (slides.length > 1) {
      let index = 0;
      setInterval(() => {
        slides[index].classList.remove('is-active');
        index = (index + 1) % slides.length;
        slides[index].classList.add('is-active');
      }, 6000);
    }
  }

  // -----------------------------------------------------------
  // 4. KV パララックス（軽量）
  // -----------------------------------------------------------
  const kvMedia = document.querySelector('.kv__image-wrap');
  let parallaxTicking = false;
  const updateParallax = () => {
    if (kvMedia) {
      const offset = Math.min(window.scrollY * 0.15, 120);
      kvMedia.style.transform = `translateY(${-offset}px)`;
    }
    parallaxTicking = false;
  };
  if (!reduceMotion && kvMedia) {
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  // -----------------------------------------------------------
  // 4-2. bg-decor 雲：CSSアニメーション（cloud-drift）に一本化したためJS処理は削除
  // -----------------------------------------------------------

  // -----------------------------------------------------------
  // 5. IntersectionObserver（フェードアップ）
  // -----------------------------------------------------------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    // フォールバック：全表示
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // -----------------------------------------------------------
  // 6. Numbers カウントアップ
  // -----------------------------------------------------------
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * easeOutCubic(progress));
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const numIo = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 各.numを100msずつずらしてカウント開始（視線が順に流れる演出）
          entry.target.querySelectorAll('.num').forEach((el, i) => {
            setTimeout(() => animateCount(el), i * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    const numbersSection = document.querySelector('.numbers');
    if (numbersSection) numIo.observe(numbersSection);
  } else {
    document.querySelectorAll('.num').forEach((el) => {
      el.textContent = (parseInt(el.dataset.count, 10) || 0).toLocaleString();
    });
  }

  // -----------------------------------------------------------
  // 7. tel: リンク 簡易難読化（mailto相当の対策／実装時にダミー番号で稼働）
  //    HTML上の "0000-00-0000" はダミー。実番号確定後は HTML を直接書き換え。
  // -----------------------------------------------------------
  // 現状はダミー番号がそのまま表示されるだけ。将来 data 属性に分割番号を入れて組み立てる方針も可。

  // -----------------------------------------------------------
  // 8. お問い合わせフォーム（honeypot + time-trap + 簡易バリデーション）
  // -----------------------------------------------------------
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  let formLoadedAt = Date.now();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formStatus.classList.remove('is-success', 'is-error');
      formStatus.textContent = '';

      // honeypot
      const honey = form.querySelector('input[name="website"]');
      if (honey && honey.value.trim() !== '') {
        // bot 判定 → 何もせず成功風に表示
        formStatus.classList.add('is-success');
        formStatus.textContent = 'お問い合わせありがとうございました。';
        form.reset();
        return;
      }

      // time-trap（読み込みから3秒以内の送信はbot扱い）
      if (Date.now() - formLoadedAt < 3000) {
        formStatus.classList.add('is-error');
        formStatus.textContent = '送信に失敗しました。しばらく経ってから再度お試しください。';
        return;
      }

      // 簡易バリデーション（HTML5のrequired属性＋メール形式）
      let hasError = false;
      form.querySelectorAll('[required]').forEach((el) => {
        if (!el.value || (el.type === 'checkbox' && !el.checked)) {
          hasError = true;
        }
      });
      const email = form.querySelector('#f-email');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        hasError = true;
      }
      if (hasError) {
        formStatus.classList.add('is-error');
        formStatus.textContent = '入力内容をご確認ください。';
        return;
      }

      // 成功時（実際の送信はエンドポイント設定後に差し替え）
      formStatus.classList.add('is-success');
      formStatus.textContent = 'お問い合わせありがとうございました。担当者より3営業日以内にご連絡いたします。';
      form.reset();
      formLoadedAt = Date.now();
    });
  }

  // -----------------------------------------------------------
  // 9. Voices 無限ループMarquee（カード複製＋CSSアニメーション）
  //    - CSS側で keyframes voices-scroll により transform: translateX(-50%) するため、
  //      表示幅の2倍の要素が必要。元のli要素を一度だけ複製してaria-hiddenで追加する。
  //    - prefers-reduced-motion 時はアニメーション停止＆複製スキップ。
  // -----------------------------------------------------------
  const voicesMarquee = document.querySelector('[data-voices-marquee]');
  if (voicesMarquee) {
    const voicesList = voicesMarquee.querySelector('.voices__list');
    if (voicesList && !reduceMotion) {
      const originals = Array.from(voicesList.children);
      originals.forEach((el) => {
        const clone = el.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.classList.add('voice-card--clone');
        voicesList.appendChild(clone);
      });
    } else if (voicesList && reduceMotion) {
      // 動作軽減設定：アニメーションを停止
      voicesList.style.animation = 'none';
      voicesList.style.flexWrap = 'wrap';
      voicesList.style.width = 'auto';
      voicesList.style.justifyContent = 'center';
    }
  }

})();
