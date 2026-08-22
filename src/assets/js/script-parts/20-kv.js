  // -----------------------------------------------------------
  // 3. KVスライダー（3枚クロスフェード + IntersectionObserver停止制御）
  // -----------------------------------------------------------
  const slider = document.querySelector('[data-kv-slider]');
  let kvInterval = null;

  if (slider && !reduceMotion) {
    const slides = Array.from(slider.querySelectorAll('.kv__img'));
    if (slides.length > 1) {
      let index = 0;
      const indicatorLabel = slider.closest('.kv__image-wrap')?.querySelector('.kv__indicator-label');
      const indicatorBar = slider.closest('.kv__image-wrap')?.querySelector('.kv__indicator-bar');
      const updateIndicator = () => {
        if (indicatorLabel) {
          indicatorLabel.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        }
        indicatorBar?.style.setProperty('--kv-progress', String(index + 1));
      };
      updateIndicator();
      const startSlider = () => {
        if (kvInterval) return;
        kvInterval = setInterval(() => {
          slides[index].classList.remove('is-active');
          index = (index + 1) % slides.length;
          slides[index].classList.add('is-active');
          updateIndicator();
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

