export type ColorThemeId =
  | 'coral-red'
  | 'warm-peach'
  | 'sunny-amber'
  | 'cocoa-brown'
  | 'chartreuse-lime'
  | 'fresh-lime'
  | 'leaf-green'
  | 'emerald-teal'
  | 'sky-cyan'
  | 'cerulean-blue'
  | 'royal-indigo'
  | 'soft-violet'
  | 'orchid-magenta'
  | 'rose-pink'
  | 'cool-mist'
  | 'coral-dark-split'
  | 'peach-dark-split'
  | 'amber-dark-split'
  | 'cocoa-dark-split'
  | 'lime-dark-split'
  | 'fresh-lime-dark-split'
  | 'leaf-green-dark-split'
  | 'emerald-dark-split'
  | 'sky-cyan-dark-split'
  | 'cerulean-dark-split'
  | 'royal-indigo-dark-split'
  | 'violet-dark-split'
  | 'orchid-dark-split'
  | 'rose-pink-dark-split'
  | 'berry-plum-split'
  | 'deep-berry-split';

export interface ThemeTokens {
  bgMain: string;
  bgCard: string;
  bgElevated: string;
  textPrimary: string;
  textMuted: string;
  accent: string;
  accentContrast: string;
  border: string;
}

export interface ClassicThemeDefinition {
  id: ColorThemeId;
  label: string;
  type: 'solid' | 'split';
  swatch: string;
  topColor: string;
  bottomColor?: string;
  isDark: boolean;
  pairedThemeId: ColorThemeId;
  tokens: ThemeTokens;
}

export const CLASSIC_THEMES: ClassicThemeDefinition[] = [
  // Row 1 — Solid
  {
    id: 'coral-red',
    label: 'Coral Red',
    type: 'solid',
    swatch: '#F6644F',
    topColor: '#F6644F',
    isDark: false,
    pairedThemeId: 'coral-dark-split',
    tokens: {
      bgMain: '#FCD8D2',
      bgCard: '#FFF6F5',
      bgElevated: '#F9E4E0',
      textPrimary: '#24110E',
      textMuted: '#7A4C45',
      accent: '#F6644F',
      accentContrast: '#FFFFFF',
      border: '#F0B9B0',
    },
  },
  {
    id: 'warm-peach',
    label: 'Warm Peach',
    type: 'solid',
    swatch: '#FF9955',
    topColor: '#FF9955',
    isDark: false,
    pairedThemeId: 'peach-dark-split',
    tokens: {
      bgMain: '#FFE2CC',
      bgCard: '#FFF8F2',
      bgElevated: '#FCEAD9',
      textPrimary: '#26160A',
      textMuted: '#7E573B',
      accent: '#FF9955',
      accentContrast: '#1E1208',
      border: '#F4C7A3',
    },
  },
  {
    id: 'sunny-amber',
    label: 'Sunny Amber',
    type: 'solid',
    swatch: '#FFC72C',
    topColor: '#FFC72C',
    isDark: false,
    pairedThemeId: 'amber-dark-split',
    tokens: {
      bgMain: '#FFEDB3',
      bgCard: '#FFFDF4',
      bgElevated: '#FDF2CC',
      textPrimary: '#241C07',
      textMuted: '#786532',
      accent: '#FFC72C',
      accentContrast: '#1D1705',
      border: '#EED27B',
    },
  },
  {
    id: 'cocoa-brown',
    label: 'Cocoa Brown',
    type: 'solid',
    swatch: '#8C4E37',
    topColor: '#8C4E37',
    isDark: false,
    pairedThemeId: 'cocoa-dark-split',
    tokens: {
      bgMain: '#E5CFC6',
      bgCard: '#FBF7F5',
      bgElevated: '#F0DFD8',
      textPrimary: '#21130E',
      textMuted: '#6E4E42',
      accent: '#8C4E37',
      accentContrast: '#FFFFFF',
      border: '#CEAFA2',
    },
  },
  {
    id: 'chartreuse-lime',
    label: 'Chartreuse Lime',
    type: 'solid',
    swatch: '#C4D600',
    topColor: '#C4D600',
    isDark: false,
    pairedThemeId: 'lime-dark-split',
    tokens: {
      bgMain: '#ECF3AD',
      bgCard: '#FCFDF2',
      bgElevated: '#F2F7C8',
      textPrimary: '#1D2106',
      textMuted: '#5E662E',
      accent: '#C4D600',
      accentContrast: '#191C04',
      border: '#D2DC7E',
    },
  },
  {
    id: 'fresh-lime',
    label: 'Fresh Lime',
    type: 'solid',
    swatch: '#8CE043',
    topColor: '#8CE043',
    isDark: false,
    pairedThemeId: 'fresh-lime-dark-split',
    tokens: {
      bgMain: '#DAF7BE',
      bgCard: '#F8FEF2',
      bgElevated: '#E7FAD4',
      textPrimary: '#132208',
      textMuted: '#4B6E32',
      accent: '#8CE043',
      accentContrast: '#101E05',
      border: '#B7E68A',
    },
  },

  // Row 2 — Solid
  {
    id: 'leaf-green',
    label: 'Leaf Green',
    type: 'solid',
    swatch: '#32C759',
    topColor: '#32C759',
    isDark: false,
    pairedThemeId: 'leaf-green-dark-split',
    tokens: {
      bgMain: '#C2F0CE',
      bgCard: '#F4FDF6',
      bgElevated: '#D8F7E0',
      textPrimary: '#0C2312',
      textMuted: '#3B6E48',
      accent: '#32C759',
      accentContrast: '#091C0E',
      border: '#98DEAA',
    },
  },
  {
    id: 'emerald-teal',
    label: 'Emerald Teal',
    type: 'solid',
    swatch: '#10B981',
    topColor: '#10B981',
    isDark: false,
    pairedThemeId: 'emerald-dark-split',
    tokens: {
      bgMain: '#BAECE0',
      bgCard: '#F2FCF9',
      bgElevated: '#D2F5EB',
      textPrimary: '#0A241C',
      textMuted: '#376E5D',
      accent: '#10B981',
      accentContrast: '#FFFFFF',
      border: '#8EDAC4',
    },
  },
  {
    id: 'sky-cyan',
    label: 'Sky Cyan',
    type: 'solid',
    swatch: '#47B8F5',
    topColor: '#47B8F5',
    isDark: false,
    pairedThemeId: 'sky-cyan-dark-split',
    tokens: {
      bgMain: '#C5E9FD',
      bgCard: '#F4FBFF',
      bgElevated: '#DAF1FE',
      textPrimary: '#0B1E2B',
      textMuted: '#3D657E',
      accent: '#47B8F5',
      accentContrast: '#081924',
      border: '#97D5FA',
    },
  },
  {
    id: 'cerulean-blue',
    label: 'Cerulean Blue',
    type: 'solid',
    swatch: '#4A89DC',
    topColor: '#4A89DC',
    isDark: false,
    pairedThemeId: 'cerulean-dark-split',
    tokens: {
      bgMain: '#C9DEF8',
      bgCard: '#F5F9FE',
      bgElevated: '#DCEBFA',
      textPrimary: '#0E1C30',
      textMuted: '#425E84',
      accent: '#4A89DC',
      accentContrast: '#FFFFFF',
      border: '#9EC0EE',
    },
  },
  {
    id: 'royal-indigo',
    label: 'Royal Indigo',
    type: 'solid',
    swatch: '#4B6EF5',
    topColor: '#4B6EF5',
    isDark: false,
    pairedThemeId: 'royal-indigo-dark-split',
    tokens: {
      bgMain: '#CAD4FD',
      bgCard: '#F5F7FF',
      bgElevated: '#DDE4FE',
      textPrimary: '#101633',
      textMuted: '#465387',
      accent: '#4B6EF5',
      accentContrast: '#FFFFFF',
      border: '#A1B3FA',
    },
  },
  {
    id: 'soft-violet',
    label: 'Soft Violet',
    type: 'solid',
    swatch: '#9B6EF3',
    topColor: '#9B6EF3',
    isDark: false,
    pairedThemeId: 'violet-dark-split',
    tokens: {
      bgMain: '#E2D4FC',
      bgCard: '#F9F6FF',
      bgElevated: '#EDE4FE',
      textPrimary: '#1B1133',
      textMuted: '#5C4987',
      accent: '#9B6EF3',
      accentContrast: '#FFFFFF',
      border: '#C5AEF8',
    },
  },

  // Row 3 — Solid & Split
  {
    id: 'orchid-magenta',
    label: 'Orchid Magenta',
    type: 'solid',
    swatch: '#DA62E8',
    topColor: '#DA62E8',
    isDark: false,
    pairedThemeId: 'orchid-dark-split',
    tokens: {
      bgMain: '#F5CEF9',
      bgCard: '#FEF6FF',
      bgElevated: '#F9E0FC',
      textPrimary: '#28102C',
      textMuted: '#75457D',
      accent: '#DA62E8',
      accentContrast: '#FFFFFF',
      border: '#E5A7EE',
    },
  },
  {
    id: 'rose-pink',
    label: 'Rose Pink',
    type: 'solid',
    swatch: '#FF4D94',
    topColor: '#FF4D94',
    isDark: false,
    pairedThemeId: 'rose-pink-dark-split',
    tokens: {
      bgMain: '#FFC9DF',
      bgCard: '#FFF5F9',
      bgElevated: '#FFE0ED',
      textPrimary: '#2B0F1B',
      textMuted: '#7E435B',
      accent: '#FF4D94',
      accentContrast: '#FFFFFF',
      border: '#F99EC2',
    },
  },
  {
    id: 'cool-mist',
    label: 'Cool Mist',
    type: 'solid',
    swatch: '#E2E6EC',
    topColor: '#E2E6EC',
    isDark: false,
    pairedThemeId: 'cerulean-dark-split',
    tokens: {
      bgMain: '#E2E6EC',
      bgCard: '#F8FAFC',
      bgElevated: '#D4DAE3',
      textPrimary: '#1A202C',
      textMuted: '#526075',
      accent: '#3B495E',
      accentContrast: '#FFFFFF',
      border: '#BFC8D6',
    },
  },
  {
    id: 'coral-dark-split',
    label: 'Coral Dark Split',
    type: 'split',
    swatch: '#F6644F',
    topColor: '#F6644F',
    bottomColor: '#252830',
    isDark: true,
    pairedThemeId: 'coral-red',
    tokens: {
      bgMain: '#252830',
      bgCard: '#32323A',
      bgElevated: '#1D1F26',
      textPrimary: '#F7F4F4',
      textMuted: '#B0A3A4',
      accent: '#F6644F',
      accentContrast: '#FFFFFF',
      border: '#4C3D42',
    },
  },
  {
    id: 'peach-dark-split',
    label: 'Peach Dark Split',
    type: 'split',
    swatch: '#FF9955',
    topColor: '#FF9955',
    bottomColor: '#252830',
    isDark: true,
    pairedThemeId: 'warm-peach',
    tokens: {
      bgMain: '#252830',
      bgCard: '#323137',
      bgElevated: '#1D1F26',
      textPrimary: '#F7F5F2',
      textMuted: '#B2A69B',
      accent: '#FF9955',
      accentContrast: '#1E1208',
      border: '#4C423B',
    },
  },
  {
    id: 'amber-dark-split',
    label: 'Amber Dark Split',
    type: 'split',
    swatch: '#FFC72C',
    topColor: '#FFC72C',
    bottomColor: '#2A2D2B',
    isDark: true,
    pairedThemeId: 'sunny-amber',
    tokens: {
      bgMain: '#2A2D2B',
      bgCard: '#363934',
      bgElevated: '#212321',
      textPrimary: '#F7F6F0',
      textMuted: '#B0AE9C',
      accent: '#FFC72C',
      accentContrast: '#1D1705',
      border: '#504D3B',
    },
  },

  // Row 4 — Split
  {
    id: 'cocoa-dark-split',
    label: 'Cocoa Dark Split',
    type: 'split',
    swatch: '#8C4E37',
    topColor: '#8C4E37',
    bottomColor: '#1E242B',
    isDark: true,
    pairedThemeId: 'cocoa-brown',
    tokens: {
      bgMain: '#1E242B',
      bgCard: '#2B2E34',
      bgElevated: '#171C22',
      textPrimary: '#F5F2F0',
      textMuted: '#AA9E99',
      accent: '#8C4E37',
      accentContrast: '#FFFFFF',
      border: '#453B38',
    },
  },
  {
    id: 'lime-dark-split',
    label: 'Lime Dark Split',
    type: 'split',
    swatch: '#C4D600',
    topColor: '#C4D600',
    bottomColor: '#252B25',
    isDark: true,
    pairedThemeId: 'chartreuse-lime',
    tokens: {
      bgMain: '#252B25',
      bgCard: '#30372D',
      bgElevated: '#1C211C',
      textPrimary: '#F4F7EE',
      textMuted: '#A4AD94',
      accent: '#C4D600',
      accentContrast: '#191C04',
      border: '#474F3A',
    },
  },
  {
    id: 'fresh-lime-dark-split',
    label: 'Fresh Lime Dark Split',
    type: 'split',
    swatch: '#8CE043',
    topColor: '#8CE043',
    bottomColor: '#232B26',
    isDark: true,
    pairedThemeId: 'fresh-lime',
    tokens: {
      bgMain: '#232B26',
      bgCard: '#2D3730',
      bgElevated: '#1A211C',
      textPrimary: '#F2F7F0',
      textMuted: '#9AAE9E',
      accent: '#8CE043',
      accentContrast: '#101E05',
      border: '#3E4F40',
    },
  },
  {
    id: 'leaf-green-dark-split',
    label: 'Leaf Green Dark Split',
    type: 'split',
    swatch: '#32C759',
    topColor: '#32C759',
    bottomColor: '#1D2E2A',
    isDark: true,
    pairedThemeId: 'leaf-green',
    tokens: {
      bgMain: '#1D2E2A',
      bgCard: '#253B35',
      bgElevated: '#152320',
      textPrimary: '#EFF7F3',
      textMuted: '#8FAD9E',
      accent: '#32C759',
      accentContrast: '#091C0E',
      border: '#335246',
    },
  },
  {
    id: 'emerald-dark-split',
    label: 'Emerald Dark Split',
    type: 'split',
    swatch: '#10B981',
    topColor: '#10B981',
    bottomColor: '#172E2C',
    isDark: true,
    pairedThemeId: 'emerald-teal',
    tokens: {
      bgMain: '#172E2C',
      bgCard: '#1E3A37',
      bgElevated: '#112321',
      textPrimary: '#EEF7F5',
      textMuted: '#8BAEA9',
      accent: '#10B981',
      accentContrast: '#FFFFFF',
      border: '#2C524E',
    },
  },
  {
    id: 'sky-cyan-dark-split',
    label: 'Sky Cyan Dark Split',
    type: 'split',
    swatch: '#47B8F5',
    topColor: '#47B8F5',
    bottomColor: '#172A3A',
    isDark: true,
    pairedThemeId: 'sky-cyan',
    tokens: {
      bgMain: '#172A3A',
      bgCard: '#1F364A',
      bgElevated: '#11202D',
      textPrimary: '#EEF5FB',
      textMuted: '#8CA7BE',
      accent: '#47B8F5',
      accentContrast: '#081924',
      border: '#2E4C66',
    },
  },

  // Row 5 — Split
  {
    id: 'cerulean-dark-split',
    label: 'Cerulean Dark Split',
    type: 'split',
    swatch: '#4A89DC',
    topColor: '#4A89DC',
    bottomColor: '#17283E',
    isDark: true,
    pairedThemeId: 'cerulean-blue',
    tokens: {
      bgMain: '#17283E',
      bgCard: '#1F3450',
      bgElevated: '#111F31',
      textPrimary: '#EEF4FB',
      textMuted: '#8FA5C2',
      accent: '#4A89DC',
      accentContrast: '#FFFFFF',
      border: '#2E496D',
    },
  },
  {
    id: 'royal-indigo-dark-split',
    label: 'Royal Indigo Dark Split',
    type: 'split',
    swatch: '#4B6EF5',
    topColor: '#4B6EF5',
    bottomColor: '#18223D',
    isDark: true,
    pairedThemeId: 'royal-indigo',
    tokens: {
      bgMain: '#18223D',
      bgCard: '#212D4F',
      bgElevated: '#121A2F',
      textPrimary: '#EFF2FB',
      textMuted: '#929EC2',
      accent: '#4B6EF5',
      accentContrast: '#FFFFFF',
      border: '#32426E',
    },
  },
  {
    id: 'violet-dark-split',
    label: 'Violet Dark Split',
    type: 'split',
    swatch: '#9B6EF3',
    topColor: '#9B6EF3',
    bottomColor: '#241E3B',
    isDark: true,
    pairedThemeId: 'soft-violet',
    tokens: {
      bgMain: '#241E3B',
      bgCard: '#2F274C',
      bgElevated: '#1B162D',
      textPrimary: '#F4F0FB',
      textMuted: '#A59AC4',
      accent: '#9B6EF3',
      accentContrast: '#FFFFFF',
      border: '#44386B',
    },
  },
  {
    id: 'orchid-dark-split',
    label: 'Orchid Dark Split',
    type: 'split',
    swatch: '#DA62E8',
    topColor: '#DA62E8',
    bottomColor: '#2F1D38',
    isDark: true,
    pairedThemeId: 'orchid-magenta',
    tokens: {
      bgMain: '#2F1D38',
      bgCard: '#3D2649',
      bgElevated: '#23152A',
      textPrimary: '#F8F0FA',
      textMuted: '#B396BD',
      accent: '#DA62E8',
      accentContrast: '#FFFFFF',
      border: '#553663',
    },
  },
  {
    id: 'rose-pink-dark-split',
    label: 'Rose Pink Dark Split',
    type: 'split',
    swatch: '#FF4D94',
    topColor: '#FF4D94',
    bottomColor: '#331D2B',
    isDark: true,
    pairedThemeId: 'rose-pink',
    tokens: {
      bgMain: '#331D2B',
      bgCard: '#422538',
      bgElevated: '#261520',
      textPrimary: '#FAF0F5',
      textMuted: '#BC94AA',
      accent: '#FF4D94',
      accentContrast: '#FFFFFF',
      border: '#5C334B',
    },
  },
  {
    id: 'berry-plum-split',
    label: 'Berry Plum Split',
    type: 'split',
    swatch: '#E84A8A',
    topColor: '#E84A8A',
    bottomColor: '#262133',
    isDark: true,
    pairedThemeId: 'rose-pink',
    tokens: {
      bgMain: '#262133',
      bgCard: '#322B43',
      bgElevated: '#1D1927',
      textPrimary: '#F6F1F8',
      textMuted: '#A89BB9',
      accent: '#E84A8A',
      accentContrast: '#FFFFFF',
      border: '#493D5E',
    },
  },

  // Row 6 — Split
  {
    id: 'deep-berry-split',
    label: 'Deep Berry Split',
    type: 'split',
    swatch: '#E54886',
    topColor: '#E54886',
    bottomColor: '#241F31',
    isDark: true,
    pairedThemeId: 'rose-pink',
    tokens: {
      bgMain: '#241F31',
      bgCard: '#302941',
      bgElevated: '#1B1725',
      textPrimary: '#F6F1F8',
      textMuted: '#A699B8',
      accent: '#E54886',
      accentContrast: '#FFFFFF',
      border: '#463B5B',
    },
  },
];

export const DEFAULT_LIGHT_THEME_ID: ColorThemeId = 'cool-mist';
export const DEFAULT_DARK_THEME_ID: ColorThemeId = 'emerald-dark-split';

export const findClassicTheme = (id: string | null | undefined): ClassicThemeDefinition | undefined =>
  CLASSIC_THEMES.find((t) => t.id === id);

export const applyThemeTokens = (themeId: ColorThemeId) => {
  const theme = findClassicTheme(themeId);
  if (!theme || typeof document === 'undefined') return;
  const root = document.documentElement;
  const { tokens } = theme;
  root.setAttribute('data-theme', theme.id);
  root.style.setProperty('--bg-main', tokens.bgMain);
  root.style.setProperty('--bg-card', tokens.bgCard);
  root.style.setProperty('--bg-elevated', tokens.bgElevated);
  root.style.setProperty('--text-primary', tokens.textPrimary);
  root.style.setProperty('--text-muted', tokens.textMuted);
  root.style.setProperty('--accent-gold', tokens.accent);
  root.style.setProperty('--accent-contrast', tokens.accentContrast);
  root.style.setProperty('--border', tokens.border);
  root.style.backgroundColor = tokens.bgMain;
  if (document.body) {
    document.body.style.backgroundColor = tokens.bgMain;
  }
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', tokens.bgMain);
  }
};

export const resolveThemeId = (saved: string | null | undefined, fallbackDark = false): ColorThemeId => {
  const exact = findClassicTheme(saved);
  if (exact) return exact.id;

  switch (saved) {
    case 'emerald':
      return fallbackDark ? 'emerald-dark-split' : 'emerald-teal';
    case 'ocean':
      return fallbackDark ? 'cerulean-dark-split' : 'cerulean-blue';
    case 'royal':
      return fallbackDark ? 'violet-dark-split' : 'soft-violet';
    case 'crimson':
      return fallbackDark ? 'rose-pink-dark-split' : 'rose-pink';
    case 'mono':
      return fallbackDark ? 'coral-dark-split' : 'cool-mist';
    default:
      return fallbackDark ? DEFAULT_DARK_THEME_ID : DEFAULT_LIGHT_THEME_ID;
  }
};
