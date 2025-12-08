import type { ThemeConfig } from 'antd';

/**
 * Powerlifting Manager Theme
 * Light blue and clean color scheme for a professional look
 */

// Color palette
export const colors = {
  // Primary - Light Blue
  primary: '#1890FF',
  primaryHover: '#40A9FF',
  primaryActive: '#096DD9',
  primaryLight: '#E6F7FF',

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
      primaryShadow: '0 2px 4px rgba(24, 144, 255, 0.3)',
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
    colorBgContainer: '#1F1F1F',
    colorBgLayout: '#141414',
    colorBgElevated: '#262626',
    colorBgSpotlight: '#1F1F1F',

    // Text - Light
    colorText: 'rgba(255, 255, 255, 0.88)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorTextDisabled: 'rgba(255, 255, 255, 0.25)',

    // Border
    colorBorder: '#434343',
    colorBorderSecondary: '#303030',

    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // Font
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,

    // Links
    colorLink: colors.primary,
    colorLinkHover: colors.primaryHover,
    colorLinkActive: colors.primaryActive,
  },
  components: {
    Button: {
      primaryShadow: '0 2px 4px rgba(24, 144, 255, 0.4)',
      colorBgContainer: '#1F1F1F',
    },
    Card: {
      colorBgContainer: '#1F1F1F',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
    },
    Table: {
      headerBg: '#262626',
      rowHoverBg: 'rgba(24, 144, 255, 0.08)',
      colorBgContainer: '#1F1F1F',
    },
    Menu: {
      itemSelectedBg: 'rgba(24, 144, 255, 0.15)',
      itemSelectedColor: colors.primary,
      itemBg: 'transparent',
      darkItemBg: '#1F1F1F',
      darkSubMenuItemBg: '#141414',
    },
    Layout: {
      headerBg: '#141414',
      siderBg: '#141414',
      bodyBg: '#141414',
    },
    Input: {
      colorBgContainer: '#1F1F1F',
      colorBorder: '#434343',
    },
    Select: {
      colorBgContainer: '#1F1F1F',
      colorBgElevated: '#262626',
    },
    Modal: {
      contentBg: '#1F1F1F',
      headerBg: '#1F1F1F',
    },
    Tabs: {
      colorBgContainer: '#1F1F1F',
    },
    Alert: {
      colorInfoBg: 'rgba(24, 144, 255, 0.1)',
      colorSuccessBg: 'rgba(82, 196, 26, 0.1)',
      colorWarningBg: 'rgba(250, 173, 20, 0.1)',
      colorErrorBg: 'rgba(255, 77, 79, 0.1)',
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
