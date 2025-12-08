import type { ThemeConfig } from 'antd';

/**
 * Powerlifting Manager Theme
 * Red, black, and white color scheme inspired by powerlifting aesthetics
 */

// Color palette
export const colors = {
  // Primary - Powerlifting Red
  primary: '#D32F2F',
  primaryHover: '#B71C1C',
  primaryActive: '#C62828',
  primaryLight: '#FFCDD2',

  // Secondary - Dark Gray/Black
  secondary: '#212121',
  secondaryHover: '#424242',
  secondaryLight: '#757575',

  // Success - Green for good lifts
  success: '#4CAF50',
  successLight: '#C8E6C9',

  // Error - Red for failed lifts
  error: '#F44336',
  errorLight: '#FFCDD2',

  // Warning - Amber
  warning: '#FF9800',
  warningLight: '#FFE0B2',

  // Info - Blue
  info: '#2196F3',
  infoLight: '#BBDEFB',

  // Background colors
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F5F5F5',
  bgDark: '#1A1A1A',
  bgDarkSecondary: '#2D2D2D',

  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  textDisabled: '#BDBDBD',

  // Border colors
  border: '#E0E0E0',
  borderDark: '#424242',

  // Referee lights
  whiteLight: '#FFFFFF',
  redLight: '#F44336',
};

// Light theme configuration
export const lightTheme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: colors.primary,
    colorPrimaryHover: colors.primaryHover,
    colorPrimaryActive: colors.primaryActive,

    // Success colors
    colorSuccess: colors.success,
    colorSuccessBg: colors.successLight,

    // Error colors
    colorError: colors.error,
    colorErrorBg: colors.errorLight,

    // Warning colors
    colorWarning: colors.warning,
    colorWarningBg: colors.warningLight,

    // Info colors
    colorInfo: colors.info,
    colorInfoBg: colors.infoLight,

    // Background
    colorBgContainer: colors.bgPrimary,
    colorBgLayout: colors.bgSecondary,

    // Text
    colorText: colors.textPrimary,
    colorTextSecondary: colors.textSecondary,
    colorTextDisabled: colors.textDisabled,

    // Border
    colorBorder: colors.border,
    colorBorderSecondary: colors.border,

    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // Sizing
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // Motion
    motion: true,
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
  },
  components: {
    Button: {
      primaryShadow: '0 2px 4px rgba(211, 47, 47, 0.3)',
      defaultBorderColor: colors.border,
    },
    Card: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    Table: {
      headerBg: colors.bgSecondary,
      rowHoverBg: colors.primaryLight,
    },
    Menu: {
      itemSelectedBg: colors.primaryLight,
      itemSelectedColor: colors.primary,
    },
    Tag: {
      defaultBg: colors.bgSecondary,
    },
  },
};

// Dark theme configuration
export const darkTheme: ThemeConfig = {
  token: {
    // Primary colors
    colorPrimary: colors.primary,
    colorPrimaryHover: colors.primaryHover,
    colorPrimaryActive: colors.primaryActive,

    // Success colors
    colorSuccess: colors.success,

    // Error colors
    colorError: colors.error,

    // Warning colors
    colorWarning: colors.warning,

    // Info colors
    colorInfo: colors.info,

    // Background - Dark
    colorBgContainer: colors.bgDarkSecondary,
    colorBgLayout: colors.bgDark,
    colorBgElevated: colors.bgDarkSecondary,

    // Text - Light
    colorText: colors.textLight,
    colorTextSecondary: '#B0B0B0',
    colorTextDisabled: '#666666',

    // Border
    colorBorder: colors.borderDark,
    colorBorderSecondary: colors.borderDark,

    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    Button: {
      primaryShadow: '0 2px 4px rgba(211, 47, 47, 0.4)',
    },
    Card: {
      colorBgContainer: colors.bgDarkSecondary,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    },
    Table: {
      headerBg: colors.bgDark,
      rowHoverBg: 'rgba(211, 47, 47, 0.1)',
    },
    Menu: {
      itemSelectedBg: 'rgba(211, 47, 47, 0.2)',
      itemSelectedColor: colors.primary,
      itemBg: colors.bgDarkSecondary,
    },
    Layout: {
      headerBg: colors.bgDark,
      siderBg: colors.bgDark,
      bodyBg: colors.bgDark,
    },
  },
};

// Competition-specific colors
export const competitionColors = {
  squat: '#1976D2', // Blue
  bench: '#388E3C', // Green
  deadlift: '#F57C00', // Orange

  // Attempt results
  goodLift: colors.success,
  noLift: colors.error,
  pending: colors.warning,

  // Referee lights
  whiteLight: colors.whiteLight,
  redLight: colors.redLight,

  // Timer states
  timerNormal: colors.success,
  timerWarning: colors.warning,
  timerDanger: colors.error,
};
