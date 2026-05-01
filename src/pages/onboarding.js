// ============================================
// ONBOARDING - 6 Step Restaurant Setup
// ============================================
import { auth, db, doc, setDoc, serverTimestamp } from '../firebase.js';
import { showToast } from '../utils.js';
import { t } from '../i18n.js';

let currentStep = 0;
let formData = {};

export function renderOnboarding(container) {
  currentStep = 0;
  formData = {};
  renderStep(container);
}

function getSteps() {
  return [
    {
      title: t('s1Title', 'onboarding'),
      subtitle: t('s1Sub', 'onboarding'),
      icon: 'storefront',
      field: 'restaurantName',
      type: 'text',
      placeholder: t('s1Ph', 'onboarding')
    },
    {
      title: t('s2Title', 'onboarding'),
      subtitle: t('s2Sub', 'onboarding'),
      icon: 'public',
      field: 'country',
      type: 'select',
      options: ['Türkiye', 'Almanya', 'İngiltere', 'Amerika Birleşik Devletleri', 'Fransa', 'İtalya', 'İspanya', 'Hollanda', 'Belçika', 'Avusturya', 'İsviçre', 'Diğer']
    },
    {
      title: t('s3Title', 'onboarding'),
      subtitle: t('s3Sub', 'onboarding'),
      icon: 'phone',
      field: 'phone',
      type: 'tel',
      placeholder: t('s3Ph', 'onboarding')
    },
    {
      title: t('s4Title', 'onboarding'),
      subtitle: t('s4Sub', 'onboarding'),
      icon: 'category',
      field: 'businessType',
      type: 'business-type'
    },
    {
      title: t('s5Title', 'onboarding'),
      subtitle: t('s5Sub', 'onboarding'),
      icon: 'table_restaurant',
      field: 'tableCount',
      type: 'number',
      placeholder: t('s5Ph', 'onboarding')
    },
    {
      title: t('s6Title', 'onboarding'),
      subtitle: t('s6Sub', 'onboarding'),
      icon: 'menu_book',
      field: 'menuUpload',
      type: 'menu-upload'
    }
  ];
}

function getBusinessTypes() {
  return [
    { id: 'restaurant', name: t('bt1', 'onboarding'), icon: '🍽️' },
    { id: 'cafe', name: t('bt2', 'onboarding'), icon: '☕' },
    { id: 'fastfood', name: t('bt3', 'onboarding'), icon: '🍔' },
    { id: 'bar', name: t('bt4', 'onboarding'), icon: '🍺' },
    { id: 'patisserie', name: t('bt5', 'onboarding'), icon: '🧁' },
    { id: 'pizzeria', name: t('bt6', 'onboarding'), icon: '🍕' }
  ];
}

function renderStep(container) {
  const steps = getSteps();
  const step = steps[currentStep];
  
  container.innerHTML = `
    <div class="onboarding-page">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
      </div>
      <div class="onboarding-card animate-scaleIn">
        <div class="onboarding-progress">
          ${steps.map((_, i) => `
            <div class="step ${i < currentStep ? 'completed' : ''} ${i === currentStep ? 'active' : ''}"></div>
          `).join('')}
        </div>
        <div class="onboarding-step-info">${t('step', 'onboarding')} ${currentStep + 1} / ${steps.length}</div>
        <h2 class="onboarding-title">
          <span class="material-icons-round" style="vertical-align: middle; margin-right: 8px; color: var(--primary-light);">${step.icon}</span>
          ${step.title}
        </h2>
        <p class="onboarding-subtitle">${step.subtitle}</p>
        
        <div class="onboarding-form" id="onboarding-form">
          ${renderStepField(step)}
        </div>

        <div class="onboarding-actions">
          ${currentStep > 0 ? `
            <button class="btn btn-secondary" id="prev-btn">
              <span class="material-icons-round">arrow_back</span>
              ${t('prev', 'onboarding')}
            </button>
          ` : '<div></div>'}
          <button class="btn btn-primary" id="next-btn">
            ${currentStep === steps.length - 1 ? t('complete', 'onboarding') : t('next', 'onboarding')}
            <span class="material-icons-round">${currentStep === steps.length - 1 ? 'check' : 'arrow_forward'}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Restore previous values
  const field = step.field;
  if (formData[field]) {
    const input = document.querySelector(`#step-input`);
    if (input) input.value = formData[field];
    
    if (step.type === 'business-type') {
      const selected = document.querySelector(`.type-option[data-id="${formData[field]}"]`);
      if (selected) selected.classList.add('selected');
    }
  }

  // Event listeners
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentStep--;
      renderStep(container);
    });
  }

  nextBtn.addEventListener('click', async () => {
    // Validate & save current step
    if (!validateStep(step)) return;
    
    if (currentStep === steps.length - 1) {
      // Complete onboarding
      await completeOnboarding(container);
    } else {
      currentStep++;
      renderStep(container);
    }
  });

  // Business type selection
  if (step.type === 'business-type') {
    document.querySelectorAll('.type-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        formData[field] = opt.dataset.id;
      });
    });
  }
}

function renderStepField(step) {
  const businessTypes = getBusinessTypes();
  switch (step.type) {
    case 'text':
    case 'tel':
      return `
        <div class="input-group">
          <input type="${step.type}" id="step-input" class="input-field" 
                 placeholder="${step.placeholder}" value="${formData[step.field] || ''}" 
                 autocomplete="off">
        </div>
      `;
    case 'number':
      return `
        <div class="input-group">
          <input type="number" id="step-input" class="input-field" 
                 placeholder="${step.placeholder}" min="1" max="500" 
                 value="${formData[step.field] || ''}" autocomplete="off">
        </div>
      `;
    case 'select':
      return `
        <div class="input-group">
          <select id="step-input" class="input-field">
            <option value="">${t('selectType', 'onboarding')}</option>
            ${step.options.map(opt => `
              <option value="${opt}" ${formData[step.field] === opt ? 'selected' : ''}>${opt}</option>
            `).join('')}
          </select>
        </div>
      `;
    case 'business-type':
      return `
        <div class="type-grid">
          ${businessTypes.map(bt => `
            <div class="type-option ${formData[step.field] === bt.id ? 'selected' : ''}" data-id="${bt.id}">
              <div class="type-icon">${bt.icon}</div>
              <div class="type-name">${bt.name}</div>
            </div>
          `).join('')}
        </div>
      `;
    case 'menu-upload':
      return `
        <div class="upload-area" id="upload-area">
          <div class="upload-icon">
            <span class="material-icons-round" style="font-size:2.5rem;">cloud_upload</span>
          </div>
          <div class="upload-text">${t('uploadText', 'onboarding')}</div>
          <div class="upload-hint">${t('uploadHint', 'onboarding')}</div>
          <input type="file" id="menu-file" style="display:none" accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png">
        </div>
        <p style="text-align:center; color:var(--text-muted); font-size:0.85rem; margin-top:12px;">
          ${t('uploadLater', 'onboarding')}
        </p>
      `;
    default:
      return '';
  }
}

function validateStep(step) {
  if (step.type === 'menu-upload') {
    // Menu upload is optional
    return true;
  }

  if (step.type === 'business-type') {
    if (!formData[step.field]) {
      showToast(t('errType', 'onboarding'), 'warning');
      return false;
    }
    return true;
  }

  const input = document.getElementById('step-input');
  if (!input || !input.value.trim()) {
    showToast(t('errReq', 'onboarding'), 'warning');
    input?.classList.add('error');
    setTimeout(() => input?.classList.remove('error'), 2000);
    return false;
  }

  formData[step.field] = input.value.trim();
  return true;
}

async function completeOnboarding(container) {
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = true;
  nextBtn.innerHTML = `<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> ${t('saving', 'onboarding')}`;

  try {
    const user = auth.currentUser;
    if (!user) {
      window.location.hash = '/auth';
      return;
    }

    await setDoc(doc(db, 'users', user.uid), {
      restaurant: {
        name: formData.restaurantName || '',
        country: formData.country || '',
        phone: formData.phone || '',
        businessType: formData.businessType || '',
        tableCount: parseInt(formData.tableCount) || 10,
      },
      onboardingComplete: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    showToast(t('success', 'onboarding'), 'success');
    window.location.hash = '/admin';
  } catch (error) {
    console.error('Onboarding error:', error);
    showToast(t('error', 'onboarding'), 'error');
    nextBtn.disabled = false;
    nextBtn.innerHTML = `${t('complete', 'onboarding')} <span class="material-icons-round">check</span>`;
  }
}
