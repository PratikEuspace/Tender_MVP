import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import FieldHelpTooltip from './FieldHelpTooltip';
import {
  FORM_FIELD_LABEL_MARGIN_BOTTOM,
  formFieldStyles,
} from '../../theme/formFieldStyles';

/**
 * Standard label row: text + optional help icon + required asterisk.
 * Pass `helpKey` (help namespace) or legacy `helpText` override.
 *
 * Layout rules (English + Marathi):
 * - Label and help icon stay on one horizontal line, vertically centered.
 * - Labels prefer a single line; wrap is avoided so longer Marathi copy stays readable.
 */
const FormFieldLabel = ({
  label,
  helpKey,
  helpText,
  helpTooltipId,
  required = false,
  style,
  labelStyle,
}) => {
  const hasHelp = Boolean(helpKey || helpText?.trim());

  if (!label && !hasHelp) {
    return null;
  }

  return (
    <View style={[styles.row, style]}>
      {label ? (
        <Text
          style={[formFieldStyles.label, styles.label, labelStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
          {required ? <Text style={formFieldStyles.required}> *</Text> : null}
        </Text>
      ) : (
        <View style={styles.labelSpacer} />
      )}

      {hasHelp ? (
        <FieldHelpTooltip
          helpKey={helpKey}
          text={helpText}
          fieldLabel={label}
          tooltipId={helpTooltipId}
          style={styles.helpIcon}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: '100%',
    marginBottom: FORM_FIELD_LABEL_MARGIN_BOTTOM,
  },
  label: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    marginBottom: 0,
    maxWidth: '100%',
  },
  helpIcon: {
    flexShrink: 0,
  },
  labelSpacer: {
    flex: 1,
  },
});

export default FormFieldLabel;
