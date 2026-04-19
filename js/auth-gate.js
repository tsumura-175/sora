/* =============================================================
   簡易パスワードゲート（GitHub Pages デプロイ時のみ有効）
   - localhost / 127.0.0.1 / file:// ではスキップ
   - sessionStorage で認証状態を保持（タブを閉じるまで有効）
   ============================================================= */
(() => {
  'use strict';

  const PASS_HASH = '9e76fa1f3cfa439276ace0318a6393009e02c983d35df353f169060b7020cd94';
  const STORAGE_KEY = 'sora_auth';

  // ローカル環境では認証をスキップ
  const host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host === '' || location.protocol === 'file:') {
    return;
  }

  // 既に認証済みならスキップ
  if (sessionStorage.getItem(STORAGE_KEY) === 'ok') {
    return;
  }

  // SHA-256 ハッシュ関数
  async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // メインコンテンツを非表示
  document.documentElement.style.overflow = 'hidden';

  // 認証オーバーレイ生成
  const overlay = document.createElement('div');
  overlay.id = 'authGate';
  overlay.innerHTML = `
    <div class="auth-gate">
      <div class="auth-gate__inner">
        <p class="auth-gate__logo">はじまりの家そら</p>
        <p class="auth-gate__sub">このサイトは閲覧にパスワードが必要です</p>
        <form class="auth-gate__form" id="authForm">
          <input type="password" id="authPass" class="auth-gate__input" placeholder="パスワードを入力" autocomplete="off" autofocus>
          <button type="submit" class="auth-gate__btn">閲覧する</button>
        </form>
        <p class="auth-gate__error" id="authError"></p>
      </div>
    </div>
  `;

  // スタイル挿入
  const style = document.createElement('style');
  style.textContent = `
    .auth-gate {
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1B4F8E 0%, #2E7DD1 100%);
      font-family: "Noto Sans JP", "Hiragino Sans", sans-serif;
    }
    .auth-gate__inner {
      text-align: center;
      padding: 48px 40px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      backdrop-filter: blur(12px);
      max-width: 400px;
      width: 90vw;
    }
    .auth-gate__logo {
      font-family: "Noto Serif JP", serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.15em;
      margin: 0 0 8px;
    }
    .auth-gate__sub {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.7);
      margin: 0 0 28px;
    }
    .auth-gate__form {
      display: flex;
      gap: 8px;
    }
    .auth-gate__input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 1rem;
      outline: none;
      transition: border-color 200ms;
    }
    .auth-gate__input::placeholder { color: rgba(255,255,255,0.4); }
    .auth-gate__input:focus { border-color: rgba(255,255,255,0.7); }
    .auth-gate__btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      background: #fff;
      color: #1B4F8E;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 200ms, transform 200ms;
    }
    .auth-gate__btn:hover { background: #EEF5FB; transform: translateY(-1px); }
    .auth-gate__error {
      margin: 12px 0 0;
      font-size: 0.85rem;
      color: #ff8a8a;
      min-height: 1.2em;
    }
    .auth-gate--hide {
      opacity: 0;
      transition: opacity 400ms ease;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // DOMContentLoaded 前でも挿入可能にする
  if (document.body) {
    document.body.prepend(overlay);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.prepend(overlay);
    });
  }

  // フォーム送信ハンドラ
  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'authForm') return;
    e.preventDefault();
    const input = document.getElementById('authPass');
    const error = document.getElementById('authError');
    if (!input || !error) return;

    const hash = await sha256(input.value);
    if (hash === PASS_HASH) {
      sessionStorage.setItem(STORAGE_KEY, 'ok');
      document.documentElement.style.overflow = '';
      const gate = document.querySelector('.auth-gate');
      if (gate) {
        gate.classList.add('auth-gate--hide');
        setTimeout(() => overlay.remove(), 500);
      }
    } else {
      error.textContent = 'パスワードが正しくありません';
      input.value = '';
      input.focus();
    }
  });
})();
