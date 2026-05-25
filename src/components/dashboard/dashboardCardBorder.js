import { Platform } from 'react-native';

/**
 * Shared dashboard card surface — border + shadow from BudgetUtilisationCard.
 * Single source of truth for Dashboard and Reports card outlines.
 */
export const DASHBOARD_CARD_BORDER_WIDTH = 1;
export const DASHBOARD_CARD_BORDER_COLOR = '#999999';

export const dashboardCardBorderStyle = {
  borderWidth: DASHBOARD_CARD_BORDER_WIDTH,
  borderColor: DASHBOARD_CARD_BORDER_COLOR,
};

export const dashboardCardShadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

/** Border + shadow combined (white cards). */
export const dashboardCardSurfaceStyle = {
  ...dashboardCardBorderStyle,
  ...dashboardCardShadow,
};
