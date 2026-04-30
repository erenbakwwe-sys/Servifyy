// ============================================
// AUTH PAGE - Login & Register
// ============================================
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, doc, setDoc, serverTimestamp } from '../firebase.js';
import { showToast } from '../utils.js';

export function renderAuth(container, params = {}) {
  const isRegister = params.mode === 'register';

  container.innerHTML = `
    <div class="auth-page">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon">
            <span class="material-icons-round">restaurant_menu</span>
          </div>
          <span class="gradient-text">QR Menü</span>
        </div>
        <h2 class="auth-title">${isRegister ? 'Hesap Oluştur' : 'Hoş Geldiniz'}</h2>
        <p class="auth-subtitle">${isRegister ? '14 gün ücretsiz deneyin, kredi kartı gerekmez' : 'Hesabınıza giriş yapın'}</p>
        
        <form class="auth-form" id="auth-form">
          ${isRegister ? `
            <div class="input-group">
              <label for="auth-name">Ad Soyad</label>
              <input type="text" id="auth-name" class="input-field" placeholder="Adınız Soyadınız" required>
            </div>
          ` : ''}
          <div class="input-group">
            <label for="auth-email">E-posta</label>
            <input type="email" id="auth-email" class="input-field" placeholder="ornek@email.com" required>
          </div>
          <div class="input-group">
            <label for="auth-password">Şifre</label>
            <input type="password" id="auth-password" class="input-field" placeholder="${isRegister ? 'Min. 6 karakter' : 'Şifreniz'}" required minlength="6">
          </div>
          ${isRegister ? `
            <div class="input-group">
              <label for="auth-password2">Şifre Tekrar</label>
              <input type="password" id="auth-password2" class="input-field" placeholder="Şifrenizi tekrar girin" required minlength="6">
            </div>
          ` : ''}
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">
            <span class="material-icons-round">${isRegister ? 'person_add' : 'login'}</span>
            ${isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </form>

        <div class="auth-switch">
          ${isRegister 
            ? 'Zaten hesabınız var mı? <a onclick="window.location.hash=\'/auth\'">Giriş Yap</a>'
            : 'Hesabınız yok mu? <a onclick="window.location.hash=\'/auth?mode=register\'">Ücretsiz Kayıt Ol</a>'
          }
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('auth-submit');
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> İşleniyor...';

    try {
      if (isRegister) {
        const name = document.getElementById('auth-name').value.trim();
        const password2 = document.getElementById('auth-password2').value;

        if (password !== password2) {
          showToast('Şifreler eşleşmiyor!', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span class="material-icons-round">person_add</span> Kayıt Ol';
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name,
          email: email,
          createdAt: serverTimestamp(),
          trialStart: serverTimestamp(),
          plan: 'trial',
          onboardingComplete: false,
          themeHtml: null,
          settings: {}
        });

        showToast('Hesap oluşturuldu! Hoş geldiniz 🎉', 'success');
        window.location.hash = '/onboarding';
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Giriş başarılı!', 'success');
        // Will be redirected by auth state listener
      }
    } catch (error) {
      let message = 'Bir hata oluştu';
      if (error.code === 'auth/email-already-in-use') message = 'Bu e-posta zaten kullanılıyor';
      else if (error.code === 'auth/invalid-email') message = 'Geçersiz e-posta adresi';
      else if (error.code === 'auth/weak-password') message = 'Şifre en az 6 karakter olmalı';
      else if (error.code === 'auth/user-not-found') message = 'Kullanıcı bulunamadı';
      else if (error.code === 'auth/wrong-password') message = 'Hatalı şifre';
      else if (error.code === 'auth/invalid-credential') message = 'E-posta veya şifre hatalı';
      else message = error.message;
      showToast(message, 'error');
    } finally {
      submitBtn.disabled = false;
      if (isRegister) {
        submitBtn.innerHTML = '<span class="material-icons-round">person_add</span> Kayıt Ol';
      } else {
        submitBtn.innerHTML = '<span class="material-icons-round">login</span> Giriş Yap';
      }
    }
  });
}
