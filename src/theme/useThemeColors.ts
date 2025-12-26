import { useThemeContext } from './ThemeContext';

/**
 * Hook to get theme-aware colors that adapt to light/dark mode
 * Returns colors that maintain proper contrast ratios in both themes
 */
export function useThemeColors() {
  const { isDark } = useThemeContext();

  return {
    // Background colors
    cardBg: isDark ? '#1F1F1F' : '#FFFFFF',
    cardBgHover: isDark ? '#262626' : '#FAFAFA',
    layoutBg: isDark ? '#141414' : '#F5F5F5',
    inputBg: isDark ? '#1F1F1F' : '#FFFFFF',

    // Success colors (Good Lift - White light)
    successBg: isDark ? '#1F3A1F' : '#FFFFFF',
    successBorder: isDark ? '#52c41a' : '#1890ff',
    successText: isDark ? '#FFFFFF' : '#000000',
    successHover: isDark ? '#274F27' : '#E6F7FF',

    // Error colors (No Lift - Red light)
    errorBg: isDark ? '#3A1F1F' : '#ff4d4f',
    errorBorder: isDark ? '#ff4d4f' : '#ff4d4f',
    errorText: isDark ? '#FFFFFF' : '#FFFFFF',
    errorHover: isDark ? '#4F2727' : '#ff7875',

    // Primary colors
    primaryBg: isDark ? '#0D2847' : '#1890ff',
    primaryText: '#FFFFFF', // Always white on primary
    primaryHover: isDark ? '#11365E' : '#40a9ff',

    // Neutral colors
    neutralBg: isDark ? '#262626' : '#F5F5F5',
    neutralBorder: isDark ? '#434343' : '#D9D9D9',
    neutralText: isDark ? 'rgba(255, 255, 255, 0.88)' : '#000000',

    // Text colors
    textPrimary: isDark ? 'rgba(255, 255, 255, 0.88)' : '#000000',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : '#757575',
    textDisabled: isDark ? 'rgba(255, 255, 255, 0.25)' : '#BDBDBD',

    // Border colors
    border: isDark ? '#434343' : '#D9D9D9',
    borderLight: isDark ? '#303030' : '#E0E0E0',

    // Athlete banner
    athleteBannerBg: isDark ? '#0D3A66' : '#1890ff',
    athleteBannerText: '#FFFFFF',

    // Warning/Alert colors
    warningBg: isDark ? '#3A2E1F' : '#faad14',
    warningText: isDark ? '#FFFFFF' : '#000000',
    warningBorder: isDark ? '#faad14' : '#faad14',

    // Info colors
    infoBg: isDark ? '#1F2E3A' : '#E6F7FF',
    infoText: isDark ? '#FFFFFF' : '#000000',
    infoBorder: isDark ? '#1890ff' : '#1890ff',
  };
}
