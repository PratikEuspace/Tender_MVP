import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const EDGE = 12;

/**
 * Position a popover below (or above) an anchored field rect.
 */
export const computeAnchoredLayout = (anchor, contentHeight, options = {}) => {
  if (!anchor?.width) return null;

  const minWidth = options.minWidth ?? 120;
  const maxWidth = options.maxWidth ?? SCREEN_WIDTH - EDGE * 2;
  const menuWidth = Math.min(Math.max(anchor.width, minWidth), maxWidth);

  let left = anchor.x;
  if (left + menuWidth > SCREEN_WIDTH - EDGE) {
    left = SCREEN_WIDTH - EDGE - menuWidth;
  }
  if (left < EDGE) left = EDGE;

  const openBelowTop = anchor.y;
  const spaceBelow = SCREEN_HEIGHT - openBelowTop - EDGE;
  const fieldTop = anchor.fieldTop ?? anchor.y - (anchor.fieldHeight ?? 0);
  const spaceAbove = fieldTop - EDGE;
  const openBelow =
    spaceBelow >= contentHeight || spaceBelow >= spaceAbove;

  const top = openBelow
    ? openBelowTop
    : Math.max(EDGE, fieldTop - contentHeight);

  return {
    top,
    left,
    width: menuWidth,
    maxHeight: contentHeight,
    openBelow,
  };
};
