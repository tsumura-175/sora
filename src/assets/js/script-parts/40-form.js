  // -----------------------------------------------------------
  // 7. お問い合わせフォーム（honeypot + time-trap + バリデーション + aria-describedby）
  // -----------------------------------------------------------
  const form = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  let formLoadedAt = Date.now();

  if (form && formStatus) {
    const inquiry = new URLSearchParams(window.location.search).get('inquiry');
    applyInquiryPreset(inquiry);

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

