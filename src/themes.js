// Preset themes for jChat
export const themes = {
  default: {
    name: "Default",
    description: "Classic jChat appearance",
    nick_color: '#FFFFFF',
    // A small palette used for assigning random/default nick colors
    palette: ['#FFFFFF', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#8338EC'],
    config: {
      size: 3,
      font: 0,
      stroke: 3,
      shadow: 3,
      bots: false,
      hide_commands: false,
      hide_badges: false,
      animate: false,
      fade: false,
      small_caps: false
    }
  },
  // Example theme-level nickname color (used by the configurator preview if no per-user color exists)
  ocean: {
    name: "Ocean",
    description: "Cool blue theme",
    nick_color: '#3FC1FF',
    palette: ['#3FC1FF', '#0366A6', '#0EA5A4', '#6EE7B7', '#7DD3FC'],
    config: {
      size: 3,
      font: 0,
      stroke: 2,
      shadow: 1,
      bots: false,
      hide_commands: false,
      hide_badges: false,
      animate: false,
      fade: false,
      small_caps: false
    }
  },
  minimal: {
    name: "Minimal",
    description: "Clean and simple design",
    nick_color: '#C7CAD1',
    palette: ['#C7CAD1', '#A8AAB0', '#8B8F98', '#6B7280'],
    config: {
      size: 2,
      font: 2,
      stroke: 0,
      shadow: 0,
      bots: true,
      hide_commands: true,
      hide_badges: false,
      animate: false,
      fade: 60,
      small_caps: false
    }
  },
  gaming: {
    name: "Gaming",
    description: "Bright and energetic for gaming streams",
    nick_color: '#FF6B6B',
    palette: ['#FF6B6B', '#FFB86B', '#F9F871', '#6BFFB0', '#6BCBFF'],
    config: {
      size: 3,
      font: 6,
      stroke: 4,
      shadow: 3,
      bots: false,
      hide_commands: true,
      hide_badges: false,
      animate: true,
      fade: 30,
      small_caps: true
    }
  },
  retro: {
    name: "Retro",
    description: "Pixel art inspired design",
    nick_color: '#FFD166',
    palette: ['#FFD166', '#FF9F1C', '#FF5C7C', '#6BDEFF', '#C0FFB3'],
    config: {
      size: 2,
      font: 10,
      stroke: 2,
      shadow: 1,
      bots: true,
      hide_commands: true,
      hide_badges: false,
      animate: false,
      fade: false,
      small_caps: false
    }
  },
  elegant: {
    name: "Elegant",
    description: "Sophisticated and refined appearance",
    nick_color: '#E6E1D3',
    palette: ['#E6E1D3', '#CFC7B8', '#A89F86', '#7B6F5A'],
    config: {
      size: 2,
      font: 8,
      stroke: 1,
      shadow: 2,
      bots: true,
      hide_commands: true,
      hide_badges: false,
      animate: false,
      fade: 120,
      small_caps: false
    }
  }
};

export function getThemeNames() {
  return Object.keys(themes);
}

export function getTheme(name) {
  return themes[name] || themes.default;
}

export function getThemeNickColor(name) {
  const t = themes[name];
  if (!t) return null;
  return t.nick_color || null;
}

export function saveCustomTheme(name, config) {
  themes[name] = {
    name: name,
    description: "Custom theme",
    config: config
  };
  // Save to localStorage
  localStorage.setItem('jchat_custom_themes', JSON.stringify(themes));
}

// Load custom themes from localStorage
export function loadCustomThemes() {
  const customThemesStr = localStorage.getItem('jchat_custom_themes');
  if (customThemesStr) {
    try {
      const customThemes = JSON.parse(customThemesStr);
      // Merge custom themes with presets, avoiding overwrites
      Object.keys(customThemes).forEach(key => {
        if (!themes[key]) {
          themes[key] = customThemes[key];
        }
      });
    } catch (e) {
      console.warn('Failed to parse custom themes:', e);
    }
  }
}

// Async function to get themes from API with local fallback
export async function getThemes() {
  try {
    const response = await fetch('/api/themes');
    if (response.ok) {
      const apiThemes = await response.json();
      // Map API themes and add isCustom flag
      return apiThemes.themes.map(t => ({
        ...t,
        isCustom: true
      }));
    } else {
      console.warn('API returned non-OK status, using local themes');
    }
  } catch (error) {
    console.warn('Failed to fetch themes from API, using local themes:', error);
  }
  // Fallback to local presets
  return Object.entries(themes).map(([key, theme]) => ({
    ...theme,
    id: key,
    isCustom: false
  }));
}

// Async function to save theme to API with local fallback
export async function saveTheme(theme) {
  try {
    const response = await fetch('/api/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(theme)
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    console.log('Theme saved successfully to API');
  } catch (error) {
    console.warn('Failed to save theme to API, saving locally only:', error);
    // Fallback to local storage
    saveCustomTheme(theme.name, theme.data);
  }
  // Reload custom themes to ensure consistency
  loadCustomThemes();
}