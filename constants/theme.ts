import { Platform } from 'react-native';

export const colors = {
  primary: '#0B7A67',
  primaryDark: '#075D50',
  primarySoft: '#E8F5F1',
  primarySofter: '#F2FAF7',
  accent: '#F59E0B',
  accentSoft: '#FFF6DF',
  info: '#2F6FED',
  infoSoft: '#EBF2FF',
  danger: '#D84B4B',
  dangerSoft: '#FDECEC',
  success: '#1C8C63',
  text: '#13231F',
  textMuted: '#61736D',
  background: '#F4F8F6',
  surface: '#FFFFFF',
  border: '#DCE7E3',
  borderStrong: '#C9DAD4',
  black: '#0F1715',
  white: '#FFFFFF',
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
};

export const shadow = Platform.select({
  web: { boxShadow: '0 12px 32px rgba(23,52,43,0.09)' } as any,
  default: {
    shadowColor: '#17342B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
}) as any;
