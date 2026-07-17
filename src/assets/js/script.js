/* =============================================================
   ヘルパーステーションそら｜TOPページ Scripts
   ============================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const createRafHandler = (callback) => {
    let scheduled = false;
    return () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        callback();
        scheduled = false;
      });
    };
  };
  const isBetweenAnchorAndRelated = (anchorNav, pageRelated) => {
    const anchorBottom = anchorNav.getBoundingClientRect().bottom;
    const relatedTop = pageRelated ? pageRelated.getBoundingClientRect().top : Infinity;
    return anchorBottom < 0 && relatedTop > window.innerHeight * 0.85;
  };

  // -----------------------------------------------------------
  // 1. ヘッダー白化（スクロール80px超）
  // -----------------------------------------------------------
  const header = document.getElementById('siteHeader');
  if (!header) return;

  let lastScroll = 0;
  const updateHeader = () => {
    if (lastScroll > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  const onHeaderScroll = createRafHandler(updateHeader);
  window.addEventListener('scroll', () => {
    lastScroll = window.scrollY;
    onHeaderScroll();
  }, { passive: true });
  updateHeader();

  // -----------------------------------------------------------
  // 2. オーバーレイメニュー
  // -----------------------------------------------------------
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('overlayMenu');

  if (hamburger && overlay) {
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
      const first = overlay.querySelector(focusableSel);
      if (first) setTimeout(() => first.focus(), 400);
    };

    const closeMenu = ({ restoreFocus = true } = {}) => {
      document.body.classList.remove('menu-open');
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'メニューを開く');
      document.body.style.overflow = '';
      if (restoreFocus && lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    };

    hamburger.addEventListener('click', () => {
      if (overlay.classList.contains('is-open')) closeMenu(); else openMenu();
    });

    const overlayCloseBtn = document.getElementById('overlayClose');
    if (overlayCloseBtn) {
      overlayCloseBtn.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
    });

    // 同一ページ内アンカーを含め、メガメニューのナビリンクを選んだら必ず閉じる。
    // リンク操作時はハンバーガーへフォーカスを戻さず、通常の遷移・スクロールを優先する。
    const overlayNavigation = overlay.querySelector('.overlay-nav');
    if (overlayNavigation) {
      overlayNavigation.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link || !overlayNavigation.contains(link) || !overlay.classList.contains('is-open')) return;
        closeMenu({ restoreFocus: false });
      });
    }

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
  }

  // -----------------------------------------------------------
  // 3. KVスライダー（3枚クロスフェード + IntersectionObserver停止制御）
  // -----------------------------------------------------------
  const slider = document.querySelector('[data-kv-slider]');
  let kvInterval = null;

  if (slider && !reduceMotion) {
    const slides = Array.from(slider.querySelectorAll('.kv__img'));
    if (slides.length > 1) {
      let index = 0;
      const startSlider = () => {
        if (kvInterval) return;
        kvInterval = setInterval(() => {
          slides[index].classList.remove('is-active');
          index = (index + 1) % slides.length;
          slides[index].classList.add('is-active');
        }, 6000);
      };
      const stopSlider = () => {
        if (kvInterval) {
          clearInterval(kvInterval);
          kvInterval = null;
        }
      };

      // KV画面外時はスライダーを停止
      const kvSection = document.querySelector('.kv');
      if (kvSection && supportsIntersectionObserver) {
        const kvObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              startSlider();
            } else {
              stopSlider();
            }
          });
        }, { threshold: 0.1 });
        kvObserver.observe(kvSection);
      } else {
        startSlider();
      }
    }
  }

  // -----------------------------------------------------------
  // 4. KV パララックス（軽量 + IntersectionObserver制御）
  // -----------------------------------------------------------
  const kvMedia = document.querySelector('.kv__image-wrap');
  if (!reduceMotion && kvMedia) {
    let kvVisible = true;
    const updateParallax = () => {
      if (kvVisible) {
        const offset = Math.min(window.scrollY * 0.15, 120);
        kvMedia.style.transform = `translateY(${-offset}px)`;
      }
    };

    window.addEventListener('scroll', createRafHandler(updateParallax), { passive: true });

    // KV外ではパララックス計算をスキップ
    const kvSection = document.querySelector('.kv');
    if (kvSection && supportsIntersectionObserver) {
      const parallaxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          kvVisible = entry.isIntersecting;
        });
      }, { threshold: 0 });
      parallaxObserver.observe(kvSection);
    }
  }

  // -----------------------------------------------------------
  // 5. IntersectionObserver（フェードアップ）
  // -----------------------------------------------------------
  if (supportsIntersectionObserver) {
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
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // -----------------------------------------------------------
  // 6-B. Floating CTA：#cta セクションが画面に少しでも入ったらフェードアウト
  //      （body.is-cta-visible を付け外し、表示制御は CSS 側で行う）
  // -----------------------------------------------------------
  const ctaSection = document.getElementById('cta');
  if (ctaSection && supportsIntersectionObserver) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        document.body.classList.toggle('is-cta-visible', entry.isIntersecting);
      });
    }, { threshold: 0 });
    ctaObserver.observe(ctaSection);
  }

  // -----------------------------------------------------------
  // 6-C. Page Side Nav（下層ページ・左サイド追従ナビ）
  //      ・anchor-nav を抜けたら fade in
  //      ・page-related に差し掛かったら fade out（以降再表示しない）
  //      ・現在閲覧中のセクションに .is-active を付与
  // -----------------------------------------------------------
  const sideNav = document.getElementById('pageSideNav');
  if (sideNav) {
    const sideNavLinks = Array.from(sideNav.querySelectorAll('.page-side-nav__link'));
    const targetIds = sideNavLinks.map(a => a.getAttribute('data-target')).filter(Boolean);
    const targets = targetIds.map(id => document.getElementById(id)).filter(Boolean);

    const anchorNav = document.querySelector('.page-anchor-nav');
    const pageRelatedSec = document.querySelector('.page-related');

    // (1) 表示判定：anchor-nav が完全に画面外に出た AND page-related に差し掛かっていない
    const updateSideNavVisibility = () => {
      if (!anchorNav) return;
      sideNav.classList.toggle('is-visible', isBetweenAnchorAndRelated(anchorNav, pageRelatedSec));
    };

    const onSideNavScroll = createRafHandler(updateSideNavVisibility);
    window.addEventListener('scroll', onSideNavScroll, { passive: true });
    window.addEventListener('resize', onSideNavScroll);
    updateSideNavVisibility();

    // (2) 現在地ハイライト：4 セクションを観察し、画面中央に最も近いものに .is-active
    if (targets.length > 0 && supportsIntersectionObserver) {
      const updateActive = () => {
        const centerY = window.innerHeight * 0.35;
        let bestId = null;
        let bestDist = Infinity;
        targets.forEach((sec) => {
          const rect = sec.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const dist = Math.abs(rect.top - centerY);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = sec.id;
          }
        });
        sideNavLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('data-target') === bestId);
        });
      };

      const sectionObs = new IntersectionObserver(updateActive, {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-20% 0px -40% 0px',
      });
      targets.forEach((sec) => sectionObs.observe(sec));

      window.addEventListener('scroll', createRafHandler(updateActive), { passive: true });
      updateActive();
    }
  }

  // -----------------------------------------------------------
  // 6-D. Floating CTA：下層ページ用の表示制御
  //      ・anchor-nav が完全に画面外に出た瞬間に表示
  //      ・anchor-nav が再表示されたら退避
  //      ・既存 CSS（body.is-cta-visible で透明化）を流用
  // -----------------------------------------------------------
  const anchorNavForCta = document.querySelector('.page-anchor-nav');
  const pageRelatedForCta = document.querySelector('.page-related');
  if (pageRelatedForCta) {
    const updateCtaByAnchor = () => {
      // Keep the CTA visible after the anchor navigation (when present), then hide it before related links.
      const isPastAnchorNav = !anchorNavForCta || anchorNavForCta.getBoundingClientRect().bottom < 0;
      const hasReachedRelated = pageRelatedForCta.getBoundingClientRect().top <= window.innerHeight * 0.85;
      document.body.classList.toggle('is-cta-visible', !isPastAnchorNav || hasReachedRelated);
    };
    const onCtaScroll = createRafHandler(updateCtaByAnchor);
    window.addEventListener('scroll', onCtaScroll, { passive: true });
    window.addEventListener('resize', onCtaScroll);
    updateCtaByAnchor();
  }

  // -----------------------------------------------------------
  // 7. お問い合わせフォーム（honeypot + time-trap + バリデーション + aria-describedby）
  // -----------------------------------------------------------
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  let formLoadedAt = Date.now();

  if (form && formStatus) {
    // バリデーションエラー表示ヘルパー
    const showFieldError = (fieldId, message) => {
      const errorEl = document.getElementById(fieldId + '-error');
      const field = document.getElementById(fieldId);
      if (errorEl) errorEl.textContent = message;
      if (field) field.setAttribute('aria-invalid', message ? 'true' : 'false');
    };
    const clearAllErrors = () => {
      form.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; });
      form.querySelectorAll('[aria-invalid]').forEach(el => { el.setAttribute('aria-invalid', 'false'); });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formStatus.classList.remove('is-success', 'is-error');
      formStatus.textContent = '';
      clearAllErrors();

      // honeypot
      const honey = form.querySelector('input[name="website"]');
      if (honey && honey.value.trim() !== '') {
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

      // バリデーション
      let hasError = false;
      let firstErrorField = null;

      // 種別
      const fType = document.getElementById('f-type');
      if (fType && !fType.value) {
        showFieldError('f-type', 'お問い合わせ種別を選択してください。');
        hasError = true;
        if (!firstErrorField) firstErrorField = fType;
      }

      // お名前
      const fName = document.getElementById('f-name');
      if (fName && !fName.value.trim()) {
        showFieldError('f-name', 'お名前を入力してください。');
        hasError = true;
        if (!firstErrorField) firstErrorField = fName;
      }

      // メールアドレス
      const fEmail = document.getElementById('f-email');
      if (fEmail) {
        if (!fEmail.value.trim()) {
          showFieldError('f-email', 'メールアドレスを入力してください。');
          hasError = true;
          if (!firstErrorField) firstErrorField = fEmail;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fEmail.value)) {
          showFieldError('f-email', '正しいメールアドレスを入力してください。');
          hasError = true;
          if (!firstErrorField) firstErrorField = fEmail;
        }
      }

      // お問い合わせ内容
      const fMessage = document.getElementById('f-message');
      if (fMessage && !fMessage.value.trim()) {
        showFieldError('f-message', 'お問い合わせ内容を入力してください。');
        hasError = true;
        if (!firstErrorField) firstErrorField = fMessage;
      }

      // プライバシーポリシー
      const fPrivacy = document.getElementById('f-privacy');
      if (fPrivacy && !fPrivacy.checked) {
        hasError = true;
        if (!firstErrorField) firstErrorField = fPrivacy;
      }

      if (hasError) {
        formStatus.classList.add('is-error');
        formStatus.textContent = '入力内容をご確認ください。';
        // エラーのあるフィールドへスクロール＆フォーカス
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => firstErrorField.focus(), 400);
        }
        return;
      }

      // 成功時（実際の送信はエンドポイント設定後に差し替え）
      formStatus.classList.add('is-success');
      formStatus.textContent = 'お問い合わせありがとうございました。担当者より3営業日以内にご連絡いたします。';
      form.reset();
      formLoadedAt = Date.now();
    });
  }

})();
