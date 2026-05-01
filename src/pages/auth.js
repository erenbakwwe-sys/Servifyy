// ============================================
// AUTH PAGE - Login & Register
// ============================================
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, doc, setDoc, serverTimestamp } from '../firebase.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

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
        <h2 class="auth-title">${isRegister ? t('createAccount', 'auth') : t('welcome', 'auth')}</h2>
        <p class="auth-subtitle">${isRegister ? t('registerSub', 'auth') : t('loginSub', 'auth')}</p>
        
        <form class="auth-form" id="auth-form">
          ${isRegister ? `
            <div class="input-group">
              <label for="auth-name">${t('fullName', 'auth')}</label>
              <input type="text" id="auth-name" class="input-field" placeholder="${t('fullName', 'auth')}" required>
            </div>
          ` : ''}
          <div class="input-group">
            <label for="auth-email">${t('email', 'auth')}</label>
            <input type="email" id="auth-email" class="input-field" placeholder="${t('emailPh', 'auth')}" required>
          </div>
          <div class="input-group">
            <label for="auth-password">${t('password', 'auth')}</label>
            <input type="password" id="auth-password" class="input-field" placeholder="${isRegister ? t('passPh', 'auth') : t('password', 'auth')}" required minlength="6">
          </div>
          ${isRegister ? `
            <div class="input-group">
              <label for="auth-password2">${t('passwordAgain', 'auth')}</label>
              <input type="password" id="auth-password2" class="input-field" placeholder="${t('passwordAgain', 'auth')}" required minlength="6">
            </div>
          ` : ''}
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit">
            <span class="material-icons-round">${isRegister ? 'person_add' : 'login'}</span>
            ${isRegister ? t('registerBtn', 'auth') : t('loginBtn', 'auth')}
          </button>
        </form>

        <div class="auth-switch">
          ${isRegister 
            ? `${t('alreadyHaveAcc', 'auth')} <a onclick="window.location.hash='/auth'">${t('loginBtn', 'auth')}</a>`
            : `${t('dontHaveAcc', 'auth')} <a onclick="window.location.hash='/auth?mode=register'">${t('registerBtn', 'auth')}</a>`
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
    submitBtn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> ${t('processing', 'auth')}`;

    try {
      if (isRegister) {
        const name = document.getElementById('auth-name').value.trim();
        const password2 = document.getElementById('auth-password2').value;

        if (password !== password2) {
          showToast(t('passMatchError', 'auth'), 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span class="material-icons-round">person_add</span> ${t('registerBtn', 'auth')}`;
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        
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

        await signOut(auth);
        showToast(t('verifyEmailSent', 'auth'), 'success');
        window.location.hash = '/auth';
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          showToast(t('emailNotVerified', 'auth'), 'error');
          return;
        }
        showToast(t('loginSuccess', 'auth'), 'success');
        // Will be redirected by auth state listener
      }
    } catch (error) {
      let message = t('errorOccurred', 'auth');
      if (error.code === 'auth/email-already-in-use') message = t('emailInUse', 'auth');
      else if (error.code === 'auth/invalid-email') message = t('invalidEmail', 'auth');
      else if (error.code === 'auth/weak-password') message = t('weakPass', 'auth');
      else if (error.code === 'auth/user-not-found') message = t('userNotFound', 'auth');
      else if (error.code === 'auth/wrong-password') message = t('wrongPass', 'auth');
      else if (error.code === 'auth/invalid-credential') message = t('invalidCred', 'auth');
      else message = error.message;
      showToast(message, 'error');
    } finally {
      submitBtn.disabled = false;
      if (isRegister) {
        submitBtn.innerHTML = `<span class="material-icons-round">person_add</span> ${t('registerBtn', 'auth')}`;
      } else {
        submitBtn.innerHTML = `<span class="material-icons-round">login</span> ${t('loginBtn', 'auth')}`;
      }
    }
  });
}
