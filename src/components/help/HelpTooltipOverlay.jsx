/**
 * Non-blocking anchored help popover — no Modal, no backdrop, no close button.
 */
import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import {
  FORM_FIELD_BORDER_COLOR,
  FORM_FIELD_BORDER_RADIUS,
  FORM_FIELD_BORDER_WIDTH,
} from '../../theme/formFieldStyles';

const HelpTooltipOverlay = ({
  visible = false,
  layout = null,
  scopeLayout = null,
  children,
}) => {
  if (!visible || !layout) return null;

  // Use either top (below icon) or bottom (above icon) — never both, or the
  // panel stretches to maxHeight and recreates a large empty gap.
  const panelPosition = layout.openBelow
    ? { top: layout.top }
    : { bottom: layout.bottom };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.layer,
        scopeLayout
          ? {
              top: 0,
              left: 0,
              width: scopeLayout.width,
              // Definite height so `bottom`-anchored panels resolve correctly.
              height: scopeLayout.height,
            }
          : StyleSheet.absoluteFillObject,
      ]}
    >
      <View
        style={[
          styles.panel,
          {
            ...panelPosition,
            left: layout.left,
            width: layout.width,
            maxHeight: layout.maxHeight,
          },
        ]}
        pointerEvents="auto"
        onStartShouldSetResponder={() => true}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    ...Platform.select({
      android: { elevation: 1000 },
      default: {},
    }),
  },
  panel: {
    position: 'absolute',
    borderRadius: FORM_FIELD_BORDER_RADIUS,
    borderWidth: FORM_FIELD_BORDER_WIDTH,
    borderColor: FORM_FIELD_BORDER_COLOR,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
});

export default HelpTooltipOverlay;
