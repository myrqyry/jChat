// Core configurator script for jChat
// Handles tabs, theme management, preview, validation, URL generation

import { fonts, sizes, strokes, shadows } from '../settings.js';
import { getThemeNames, getTheme, saveCustomTheme, loadCustomThemes, themes } from '../themes.js';

// Sample messages for preview (extend from utils if available)
const sampleMessages = [
  { user: 'giambaJ', badges: ['subscriber', 'vip'], message: 'Hello world! This is a test message with emotes :peepoHappy: and badges.', isBot: false },
  { user: 'BotUser', badges: [], message: 'This is a bot message with a command !gamble', isBot: true },
  { user: 'RegularUser', badges: ['moderator'], message: 'Regular chat message with cheer 100 Nice chat!', isBot: false }
];

// Debounce utility
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadCustomThemes(); // Load any custom themes from localStorage

  const tabs = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-panel]');
  const form = document.querySelector('form[name="generator"]');
  const previewContainer = document.getElementById('preview-container') || document.createElement('div');
  previewContainer.id = 'preview-container';
  previewContainer.className = 'preview-messages flex flex-col gap-2 p-4 bg-slate-700/80 border border-slate-600 rounded-lg';
  const generateBtn = document.getElementById('generate-btn');
  const urlInput = document.getElementById('url-input');
  const copyBtn = document.getElementById('copy-btn');
  const modal = document.getElementById('custom-modal');
  const searchInput = document.getElementById('theme-search');
  const filterInput = document.getElementById('theme-filter');
  const themeGrid = document.getElementById('theme-grid');
  const customBtn = document.getElementById('custom-theme-btn');
  const saveModalBtn = document.getElementById('save-theme-btn');

  if (!themeGrid) {
    console.error('Theme grid not found');
    return;
  }

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget.dataset.tab;
      tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('active');
      });
      e.currentTarget.setAttribute('aria-selected', 'true');
      e.currentTarget.classList.add('active');
      panels.forEach(p => p.classList.add('hidden'));
      document.getElementById(target).classList.remove('hidden');
    });
  });

  // Load and render themes
  async function loadThemes() {
    try {
      const response = await fetch('/api/themes');
      if (response.ok) {
        const apiThemes = await response.json();
        return apiThemes.themes.map(t => ({ ...t, isCustom: true }));
      }
    } catch (e) {
      console.warn('API fetch failed, using local themes:', e);
    }
    // Fallback to presets
    return Object.entries(themes).map(([key, theme]) => ({ ...theme, id: key, isCustom: false }));
  }

  async function renderThemeGrid() {
    const allThemes = await loadThemes();
    themeGrid.innerHTML = '';
    allThemes.forEach(theme => {
      const card = document.createElement('div');
      card.className = 'theme-card bg-slate-700/50 border border-slate-600 rounded-lg p-4 cursor-pointer hover:bg-slate-600/50 transition-colors flex flex-col items-center';
      card.setAttribute('role', 'radio');
      card.setAttribute('aria-checked', 'false');
      card.dataset.theme = theme.id || theme.name.toLowerCase().replace(/\s+/g, '-');

      // Mini-preview
      const previewImg = await createMiniPreview(theme);
      const radio = `<input type="radio" name="theme" value="${theme.id || theme.name}" id="theme-${theme.id || theme.name}" class="sr-only">`;
      card.innerHTML = `
        ${radio}
        <label for="theme-${theme.id || theme.name}" class="flex flex-col items-center cursor-pointer w-full h-full">
          <img src="${previewImg}" alt="${theme.name} preview" class="w-full h-32 object-cover rounded mb-2">
          <span class="text-white font-semibold text-center">${theme.name}</span>
          ${theme.isCustom ? '<span class="text-xs text-slate-400">Custom</span>' : ''}
        </label>
      `;
      themeGrid.appendChild(card);
    });

    // Theme selection
    themeGrid.addEventListener('change', (e) => {
      if (e.target.name === 'theme') {
        updatePreview();
      }
    });
  }

  async function createMiniPreview(theme) {
    const tempDiv = document.createElement('div');
    tempDiv.id = 'temp-preview';
    tempDiv.style.cssText = `
      position: absolute; left: -9999px; top: -9999px;
      font-family: ${fonts[theme.config?.font || 0]}; font-size: 24px; color: ${theme.nick_color || '#fff'};
      padding: 8px; background: #1f2937; border-radius: 4px; width: 200px;
    `;
    tempDiv.innerHTML = `<span class="nick">${theme.name}</span>: Test message`;
    document.body.appendChild(tempDiv);

    // Simple canvas capture (no html2canvas needed for basic text)
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, 200, 50);
    ctx.font = '24px ' + (fonts[theme.config?.font || 0] || 'sans-serif');
    ctx.fillStyle = theme.nick_color || '#fff';
    ctx.fillText(`${theme.name}: Test`, 8, 30);

    document.body.removeChild(tempDiv);
    return canvas.toDataURL();
  }

  // Search and filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.theme-card').forEach(card => {
        const name = card.querySelector('span').textContent.toLowerCase();
        card.style.display = name.includes(term) ? 'flex' : 'none';
      });
    });
  }

  if (filterInput) {
    filterInput.addEventListener('change', (e) => {
      const showCustom = e.target.checked;
      document.querySelectorAll('.theme-card').forEach(card => {
        const isCustom = card.querySelector('.text-slate-400');
        card.style.display = showCustom || !isCustom ? 'flex' : 'none';
      });
    });
  }

  // Custom theme modal
  if (customBtn) {
    customBtn.addEventListener('click', () => {
      modal.showModal();
    });
  }

  if (modal) {
    modal.addEventListener('close', () => {
      modal.querySelector('form').reset();
    });

    if (saveModalBtn) {
      saveModalBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const formData = new FormData(modal.querySelector('form'));
        const name = formData.get('theme-name');
        const config = {
          size: parseInt(formData.get('size')) || 3,
          font: parseInt(formData.get('font')) || 0,
          stroke: parseInt(formData.get('stroke')) || 0,
          shadow: parseInt(formData.get('shadow')) || 0,
          bots: formData.get('bots') === 'on',
          hide_commands: formData.get('hide_commands') === 'on',
          hide_badges: formData.get('hide_badges') === 'on',
          animate: formData.get('animate') === 'on',
          fade: formData.get('fade') === 'on',
          small_caps: formData.get('small_caps') === 'on'
        };
        if (name) {
          await saveTheme({ id: `custom-${Date.now()}`, name, data: config });
          modal.close();
          renderThemeGrid(); // Refresh grid
        }
      });
    }
  }

  // Form validation
  form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
    }
    form.classList.add('was-validated');
  });

  form.querySelectorAll('input[required], select[required]').forEach(input => {
    input.addEventListener('blur', (e) => {
      if (e.target.validity.valid) {
        e.target.parentNode.querySelector('.invalid-feedback')?.remove();
      } else {
        showValidationError(e.target);
      }
    });
  });

  // Channel pattern validation (Twitch channel name)
  const channelInput = form.querySelector('input[name="channel"]');
  if (channelInput) {
    channelInput.setAttribute('pattern', '^[a-zA-Z0-9_]{4,25}$');
    channelInput.setAttribute('title', 'Channel name must be 4-25 alphanumeric characters');
  }

  function showValidationError(input) {
    let errorDiv = input.parentNode.querySelector('.invalid-feedback');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback text-red-400 text-sm mt-1';
      input.parentNode.appendChild(errorDiv);
    }
    errorDiv.textContent = input.validationMessage || 'Please fill out this field correctly.';
  }

  // Debounced preview update
  const debouncedUpdatePreview = debounce(updatePreview, 300);
  form.addEventListener('input', debouncedUpdatePreview);
  form.addEventListener('change', debouncedUpdatePreview);

  function updatePreview() {
    const formData = new FormData(form);
    const config = {
      size: parseInt(formData.get('size')) || 3,
      font: parseInt(formData.get('font')) || 0,
      stroke: parseInt(formData.get('stroke')) || 0,
      shadow: parseInt(formData.get('shadow')) || 0,
      bots: formData.get('bots') === 'on',
      hide_commands: formData.get('hide_commands') === 'on',
      hide_badges: formData.get('hide_badges') === 'on',
      animate: formData.get('animate') === 'on',
      fade: formData.get('fade') === 'on',
      small_caps: formData.get('small_caps') === 'on'
    };

    // Set CSS vars
    document.documentElement.style.setProperty('--chat-font-family', fonts[config.font]);
    document.documentElement.style.setProperty('--chat-font-size', `${sizes[config.size - 1] === 'large' ? '48px' : sizes[config.size - 1] === 'medium' ? '36px' : '24px'}`);
    // Stroke and shadow via classes or vars (assume CSS handles)
    if (config.small_caps) document.documentElement.style.setProperty('--chat-font-variant', 'small-caps');
    else document.documentElement.style.setProperty('--chat-font-variant', 'normal');

    // Render samples
    previewContainer.innerHTML = '';
    sampleMessages.slice(0, 3).forEach(msg => {
      if (!config.bots && msg.isBot) return;
      if (config.hide_commands && msg.message.includes('!')) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat_line';
      msgDiv.innerHTML = `
        <span class="user_info">
          ${msg.badges && !config.hide_badges ? msg.badges.map(b => `<img class="badge" src="https://example.com/badge/${b}.png" alt="${b}">`).join('') : ''}
          <span class="nick" style="color: #fff;">${msg.user}</span>:
        </span>
        <span class="message">${msg.message.replace(/:peepoHappy:/g, '<img class="emote" src="https://example.com/peepoHappy.png" alt="peepoHappy">')}</span>
      `;
      previewContainer.appendChild(msgDiv);
    });

    if (previewContainer.parentNode !== document.querySelector('[data-panel="preview"]')) {
      document.querySelector('[data-panel="preview"]').appendChild(previewContainer);
    }
  }

  // Generate URL
  if (generateBtn) {
    generateBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<span class="spinner">Loading...</span>';

      if (!form.checkValidity()) {
        form.reportValidity();
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate';
        return;
      }

      const params = new URLSearchParams();
      for (const [key, value] of new FormData(form)) {
        params.append(key, value);
      }
      const baseUrl = window.location.origin + '/overlay.html?' + params.toString();
      urlInput.value = baseUrl;

      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(baseUrl);
        // Show success (assume #result exists)
        document.getElementById('result').classList.remove('hidden');
      } catch (err) {
        console.error('Copy failed:', err);
      }

      generateBtn.disabled = false;
      generateBtn.innerHTML = 'Generate';
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(urlInput.value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });
  }

  // Initial render
  renderThemeGrid();
  updatePreview();
});

// Save theme function (global for modal)
window.saveTheme = async (theme) => {
  try {
    const response = await fetch('/api/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme)
    });
    if (response.ok) {
      console.log('Theme saved to API');
      saveCustomTheme(theme.name, theme.data); // Also save local
    }
  } catch (e) {
    console.warn('API save failed, saving local only:', e);
    saveCustomTheme(theme.name, theme.data);
  }
};