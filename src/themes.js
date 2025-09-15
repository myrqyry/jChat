// Preset themes for jChat
export const themes = {
  default: {
    name: "Default",
    description: "Classic jChat appearance",
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
  minimal: {
    name: "Minimal",
    description: "Clean and simple design",
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

export function saveCustomTheme(name, config) {
  themes[name] = {
    name: name,
    description: "Custom theme",
    config: config
  };
  // In a real app, this would save to localStorage or a server
  localStorage.setItem('jchat_custom_themes', JSON.stringify(themes));
}

export function loadCustomThemes() {
  const customThemes = localStorage.getItem('jchat_custom_themes');
  if (customThemes) {
    const parsed = JSON.parse(customThemes);
    Object.assign(themes, parsed);
  }
}