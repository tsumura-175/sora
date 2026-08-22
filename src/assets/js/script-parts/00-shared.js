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
  const inquiryPresets = {
    recruit: {
      type: '採用について',
      relation: '採用応募者',
    },
    visit: {
      type: '見学・ご相談予約',
    },
    donation: {
      type: 'ご寄付・ご支援',
    },
  };
  const applyInquiryPreset = (inquiry) => {
    const preset = inquiryPresets[inquiry];
    if (!preset) return;

    const inquiryType = document.getElementById('f-type');
    const relation = document.getElementById('f-relation');
    if (inquiryType && preset.type) inquiryType.value = preset.type;
    if (relation && preset.relation) relation.value = preset.relation;
  };

