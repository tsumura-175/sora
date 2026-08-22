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
  // 6-D. Floating CTA：全ページ共通の表示制御
  //      ・anchor-nav があるページは、完全に画面外へ出た後に表示
  //      ・終端セクションへ到達したら退避し、通過後も再表示しない
  //      ・終端は「関連ページ」→「トップ下部CTA」→「お問い合わせ」の順で選択
  //      ・既存 CSS（body.is-cta-visible で透明化）を流用
  // -----------------------------------------------------------
  const anchorNavForCta = document.querySelector('.page-anchor-nav');
  const ctaEndBoundary = document.querySelector('.page-related')
    || document.getElementById('cta')
    || document.getElementById('contact');
  if (ctaEndBoundary) {
    const updateFloatingCtaVisibility = () => {
      const isPastAnchorNav = !anchorNavForCta || anchorNavForCta.getBoundingClientRect().bottom < 0;
      const hasReachedEndBoundary = ctaEndBoundary.getBoundingClientRect().top <= window.innerHeight * 0.85;
      document.body.classList.toggle('is-cta-visible', !isPastAnchorNav || hasReachedEndBoundary);
    };
    const onCtaScroll = createRafHandler(updateFloatingCtaVisibility);
    window.addEventListener('scroll', onCtaScroll, { passive: true });
    window.addEventListener('resize', onCtaScroll);
    updateFloatingCtaVisibility();
  }

