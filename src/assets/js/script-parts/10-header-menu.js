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

    // 同一ページ内アンカーやサイドCTAを含め、メガメニュー内のリンクを選んだら必ず閉じる。
    // トップページ内のお問い合わせ導線は、メニューを閉じてからフォームへスクロールする。
    overlay.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link || !overlay.contains(link) || !overlay.classList.contains('is-open')) return;

      const destination = new URL(link.href, window.location.href);
      const isSamePageContact = (
        destination.origin === window.location.origin
        && destination.pathname === window.location.pathname
        && destination.hash === '#contact'
      );

      closeMenu({ restoreFocus: false });
      if (!isSamePageContact) return;

      const contactSection = document.getElementById('contact');
      if (!contactSection) return;

      e.preventDefault();
      applyInquiryPreset(destination.searchParams.get('inquiry'));
      window.history.pushState(null, '', `${destination.pathname}${destination.search}${destination.hash}`);
      window.requestAnimationFrame(() => {
        contactSection.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      });
    });

    const overlayNavTriggers = Array.from(overlay.querySelectorAll('[data-overlay-nav-trigger]'));
    const activateOverlayNavItem = (trigger) => {
      const item = trigger.closest('.overlay-nav__item');
      if (!item) return;

      overlayNavTriggers.forEach((candidate) => {
        const candidateItem = candidate.closest('.overlay-nav__item');
        const panelId = candidate.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        const isActive = candidate === trigger;
        candidate.setAttribute('aria-expanded', String(isActive));
        candidateItem?.classList.toggle('is-active', isActive);
        if (panel) panel.hidden = !isActive;
      });
    };

    overlayNavTriggers.forEach((trigger) => {
      trigger.addEventListener('click', () => activateOverlayNavItem(trigger));
      trigger.addEventListener('focus', () => activateOverlayNavItem(trigger));
      trigger.addEventListener('mouseenter', () => activateOverlayNavItem(trigger));
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
  }

