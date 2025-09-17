// Vanilla generator UI (no jQuery). Clean, single implementation.
console.log('script.js loaded');

function qs(selector, scope = document) { return scope.querySelector(selector); }
function qsa(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); }

function fadeOption() {
  if (fadeBool && fadeBool.checked) {
    fade.classList.remove('hidden');
    fadeSeconds.classList.remove('hidden');
  } else if (fade) {
    fade.classList.add('hidden');
    fadeSeconds.classList.add('hidden');
  }
}

function updatePreviewCSS() {
  const config = {
    size: Number(sizeSelect?.value ?? 3),
    font: Number(fontSelect?.value ?? 0),
    stroke: Number(strokeSelect?.value ?? 0),
    shadow: Number(shadowSelect?.value ?? 0),
    smallCaps: smallCapsCheckbox?.checked ?? false
  };
  setPreviewCSSVariables(config);
}

function saveCustomTheme() {
  const themeName = customThemeName?.value.trim();
  if (!themeName) { alert('Please enter a theme name'); return; }

  const config = {
    size: Number(sizeSelect?.value),
    font: Number(fontSelect?.value),
    stroke: Number(strokeSelect?.value),
    shadow: Number(shadowSelect?.value),
    bots: !!botsCheckbox?.checked,
    hide_commands: !!commandsCheckbox?.checked,
    hide_badges: !!badgesCheckbox?.checked,
    animate: !!animateCheckbox?.checked,
    fade: fadeBool?.checked ? Number(fade?.value) : false,
    small_caps: !!smallCapsCheckbox?.checked
  };

  if (typeof window.saveCustomTheme === 'function') window.saveCustomTheme(themeName, config);
  if (customThemeName) customThemeName.value = '';
  populateThemeSelector();
  if (themeSelect) themeSelect.value = themeName;
  alert(`Theme "${themeName}" saved successfully!`);
}

function populateThemeSelector() {
  const themes = window.themes || {};
  console.log('Themes:', themes);
  if (!themeSelect) {
    console.log('themeSelect not found');
    return;
  }
  if (Object.keys(themes).length === 0) {
    console.log('Themes not loaded yet, retrying...');
    setTimeout(populateThemeSelector, 10);
    return;
  }
  while (themeSelect.options.length > 1) themeSelect.remove(1);
  Object.entries(themes).forEach(([key, theme]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = theme.name;
    if (theme.description) opt.title = theme.description;
    themeSelect.appendChild(opt);
  });
  console.log('Theme selector populated with', Object.keys(themes).length, 'themes');
}

function badgesUpdate() {
  const hide = badgesCheckbox?.checked;
  qsa('#example .badge').forEach(b => b.style.display = hide ? 'none' : '');
}

function applyTheme(themeName) {
  if (!themeName) return;
  const theme = (window.themes || {})[themeName];
  if (!theme) return;
  const config = theme.config || {};

  const tl = gsap.timeline();
  tl.to('#example', { opacity: 0, duration: 0.3, ease: 'power2.out' });
  tl.call(() => {
    if (sizeSelect) sizeSelect.value = config.size ?? sizeSelect.value;
    if (fontSelect) fontSelect.value = config.font ?? fontSelect.value;
    if (strokeSelect) strokeSelect.value = config.stroke ?? 0;
    if (shadowSelect) shadowSelect.value = config.shadow ?? 0;
    if (botsCheckbox) botsCheckbox.checked = !!config.bots;
    if (commandsCheckbox) commandsCheckbox.checked = !!config.hide_commands;
    if (badgesCheckbox) badgesCheckbox.checked = !!config.hide_badges;
    if (animateCheckbox) animateCheckbox.checked = !!config.animate;
    if (smallCapsCheckbox) smallCapsCheckbox.checked = !!config.small_caps;

    if (config.fade) {
      if (fadeBool) fadeBool.checked = true;
      if (fade) fade.value = config.fade;
      fade?.classList.remove('hidden');
      fadeSeconds?.classList.remove('hidden');
    } else {
      if (fadeBool) fadeBool.checked = false;
      fade?.classList.add('hidden');
      fadeSeconds?.classList.add('hidden');
    }

    updatePreviewCSS();
    badgesUpdate();
    // Set a theme-level nickname color for the preview if provided
    try {
      const root = document.documentElement.style;
      if (theme.nick_color) {
        root.setProperty('--theme-nick-color', theme.nick_color);
      } else {
        // remove any previously set theme color
        root.removeProperty('--theme-nick-color');
      }
    } catch (e) {
      console.warn('Failed to set theme nick color', e);
    }
  });
  tl.to('#example', { opacity: 1, duration: 0.5, ease: 'power2.in' });
}

function setPreviewCSSVariables(config) {
  const root = document.documentElement.style;
  const sizeConfigs = {
    1: { fontSize: '20px', lineHeight: '30px', badgeSize: '16px', badgeMarginRight: '2px', badgeMarginBottom: '3px', badgeLastMarginRight: '3px', colonMarginRight: '8px', cheerFontWeight: '700', cheerMarginRight: '4px', cheerEmoteMaxHeight: '25px', cheerEmoteMarginBottom: '-6px', emoteMaxWidth: '75px', emoteHeight: '25px', emoteMarginRight: '-3px', emojiHeight: '22px' },
    2: { fontSize: '34px', lineHeight: '55px', badgeSize: '28px', badgeMarginRight: '4px', badgeMarginBottom: '6px', badgeLastMarginRight: '6px', colonMarginRight: '14px', cheerFontWeight: '600', cheerMarginRight: '7px', cheerEmoteMaxHeight: '42px', cheerEmoteMarginBottom: '-10px', emoteMaxWidth: '128px', emoteHeight: '42px', emoteMarginRight: '-6px', emojiHeight: '39px' },
    3: { fontSize: '48px', lineHeight: '75px', badgeSize: '40px', badgeMarginRight: '5px', badgeMarginBottom: '8px', badgeLastMarginRight: '8px', colonMarginRight: '20px', cheerFontWeight: '500', cheerMarginRight: '10px', cheerEmoteMaxHeight: '60px', cheerEmoteMarginBottom: '-15px', emoteMaxWidth: '180px', emoteHeight: '60px', emoteMarginRight: '-8px', emojiHeight: '55px' }
  };

  const sizeConfig = sizeConfigs[config.size] || sizeConfigs[3];
  Object.entries(sizeConfig).forEach(([key, value]) => root.setProperty(`--chat-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value));

  const fontConfigs = { 0: "'Baloo Tammudu 2', cursive", 1: "'Segoe UI', sans-serif", 2: "'Roboto', sans-serif", 3: "'Lato', sans-serif", 4: "'Noto Sans JP', sans-serif", 5: "'Source Code Pro', monospace", 6: "'Impact', sans-serif", 7: "'Comfortaa', cursive", 8: "'Dancing Script', cursive", 9: "'Indie Flower', cursive", 10: "'Press Start 2P', monospace", 11: "'Wallpoet', cursive" };
  root.setProperty('--chat-font-family', fontConfigs[config.font] || fontConfigs[0]);

  const strokeConfigs = { 0: 'none', 1: '1px black', 2: '2px black', 3: '3px black', 4: '4px black' };
  root.setProperty('--chat-text-stroke', strokeConfigs[config.stroke] || 'none');

  const shadowConfigs = { 0: 'none', 1: '1px 1px 2px black', 2: '2px 2px 4px black', 3: '2px 2px 6px black' };
  root.setProperty('--chat-text-shadow', shadowConfigs[config.shadow] || 'none');

  root.setProperty('--chat-font-variant', config.smallCaps ? 'small-caps' : 'normal');
}

function generateURL(e) {
  e.preventDefault();
  const channel = channelInput?.value;
  const generatedUrl = 'overlay.html?config=' + encodeURIComponent(channel);

  const data = {
    size: sizeSelect?.value,
    font: fontSelect?.value,
    stroke: (strokeSelect?.value !== '0' ? strokeSelect?.value : false),
    shadow: (shadowSelect?.value !== '0' ? shadowSelect?.value : false),
    bots: botsCheckbox?.checked,
    hide_commands: commandsCheckbox?.checked,
    hide_badges: badgesCheckbox?.checked,
    animate: animateCheckbox?.checked,
    fade: (fadeBool?.checked ? fade?.value : false),
    small_caps: smallCapsCheckbox?.checked
  };
  // include selected theme so the overlay can apply palette-based nick colors
  if (themeSelect?.value) data.theme = themeSelect.value;

  localStorage.setItem('jchat_config_' + channel, JSON.stringify(data));
  if (urlInput) urlInput.value = generatedUrl;

  if (generatorForm) generatorForm.classList.add('hidden');
  if (resultDiv) resultDiv.classList.remove('hidden');
}

function changePreview() {
  if (exampleDiv?.classList.contains('white')) {
    exampleDiv.classList.remove('white');
    if (brightnessImg) brightnessImg.src = 'img/light.png';
  } else {
    exampleDiv?.classList.add('white');
    if (brightnessImg) brightnessImg.src = 'img/dark.png';
  }
}

function copyUrl() {
  if (urlInput) navigator.clipboard.writeText(urlInput.value).catch(()=>{});
  if (alertDiv) {
    alertDiv.style.visibility = 'visible';
    alertDiv.style.opacity = '1';
  }
}

function showUrl() {
  if (alertDiv) {
    alertDiv.style.opacity = '0';
    setTimeout(() => { alertDiv.style.visibility = 'hidden'; }, 200);
  }
}

function resetForm() {
  if (channelInput) channelInput.value = '';
  if (sizeSelect) sizeSelect.value = '3';
  if (fontSelect) fontSelect.value = '0';
  if (strokeSelect) strokeSelect.value = '0';
  if (shadowSelect) shadowSelect.value = '0';
  if (botsCheckbox) botsCheckbox.checked = false;
  if (commandsCheckbox) commandsCheckbox.checked = false;
  if (badgesCheckbox) badgesCheckbox.checked = false;
  if (animateCheckbox) animateCheckbox.checked = false;
  if (fadeBool) fadeBool.checked = false;
  if (fade) {
    fade.classList.add('hidden');
    fade.value = '30';
  }
  if (fadeSeconds) fadeSeconds.classList.add('hidden');
  if (smallCapsCheckbox) smallCapsCheckbox.checked = false;

  updatePreviewCSS();
  badgesUpdate();
  if (exampleDiv?.classList.contains('white')) changePreview();

  if (resultDiv) resultDiv.classList.add('hidden');
  if (generatorForm) generatorForm.classList.remove('hidden');
  showUrl();
}

// Element bindings
const generatorForm = qs("form[name='generator']");
const channelInput = qs('input[name="channel"]');
const themeSelect = qs('#theme');
const animateCheckbox = qs('input[name="animate"]');
const botsCheckbox = qs('input[name="bots"]');
const fadeBool = qs("input[name='fade_bool']");
const fade = qs("input[name='fade']");
const fadeSeconds = qs('#fade_seconds');
const commandsCheckbox = qs("input[name='commands']");
const smallCapsCheckbox = qs("input[name='small_caps']");
const badgesCheckbox = qs("input[name='badges']");
const sizeSelect = qs("select[name='size']");
const fontSelect = qs("select[name='font']");
const strokeSelect = qs("select[name='stroke']");
const shadowSelect = qs("select[name='shadow']");
const brightnessImg = qs('#brightness');
const exampleDiv = qs('#example');
const resultDiv = qs('#result');
const urlInput = qs('#url');
const alertDiv = qs('#alert');
const resetBtn = qs('#reset');
const customThemeName = qs('#custom_theme_name');

// Event listeners
fadeBool?.addEventListener('change', fadeOption);
sizeSelect?.addEventListener('change', updatePreviewCSS);
fontSelect?.addEventListener('change', updatePreviewCSS);
strokeSelect?.addEventListener('change', updatePreviewCSS);
shadowSelect?.addEventListener('change', updatePreviewCSS);
smallCapsCheckbox?.addEventListener('change', updatePreviewCSS);
themeSelect?.addEventListener('change', () => {
  const val = themeSelect?.value;
  if (!val) {
    // clear theme nick color when no theme is selected
    try { document.documentElement.style.removeProperty('--theme-nick-color'); } catch (e) {}
  }
  applyTheme(val);
});
badgesCheckbox?.addEventListener('change', badgesUpdate);
generatorForm?.addEventListener('submit', generateURL);
brightnessImg?.addEventListener('click', changePreview);
urlInput?.addEventListener('click', copyUrl);
alertDiv?.addEventListener('click', showUrl);
resetBtn?.addEventListener('click', (e) => { e.preventDefault(); resetForm(); });
qs('#save_theme')?.addEventListener('click', (e) => { e.preventDefault(); saveCustomTheme(); });

// Initialize theme selector
populateThemeSelector();
