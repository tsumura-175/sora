/* =============================================================
   簡易Basic認証ゲート（GitHub Pages デプロイ時のみ有効）
   ============================================================= */
(() => {
  'use strict';

  const USER = 'sora';
  const PASS = 'sora_test';
  const KEY  = 'sora_auth';

  // ローカル環境ではスキップ
  const h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '' || location.protocol === 'file:') return;

  // 認証済みならスキップ
  if (sessionStorage.getItem(KEY) === 'ok') return;

  // ページ非表示
  document.documentElement.style.visibility = 'hidden';

  window.addEventListener('DOMContentLoaded', () => {
    const ok = prompt('ユーザー名を入力してください');
    if (ok === USER) {
      const pw = prompt('パスワードを入力してください');
      if (pw === PASS) {
        sessionStorage.setItem(KEY, 'ok');
        document.documentElement.style.visibility = '';
        return;
      }
    }
    document.body.innerHTML = '<p style="text-align:center;margin-top:40vh;font-size:1.2rem;">認証に失敗しました。ページを再読み込みしてください。</p>';
    document.documentElement.style.visibility = '';
  });
})();
