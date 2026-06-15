/**
 * Chooses dropdown direction and max height from trigger position on screen.
 * Used instead of react-native-element-dropdown's built-in "auto" (too conservative).
 */

const DEFAULT_GAP = 8;
const MIN_MENU_HEIGHT = 100;

/**
 * @param {object} params
 * @param {number} params.pageY - Trigger top (measureInWindow)
 * @param {number} params.triggerHeight
 * @param {number} params.windowHeight
 * @param {number} [params.keyboardHeight]
 * @param {number} [params.preferredMaxHeight]
 * @param {number} [params.gap]
 * @returns {{ position: 'top' | 'bottom', maxHeight: number }}
 */
export const computeAdaptiveDropdownPlacement = ({
  pageY,
  triggerHeight,
  windowHeight,
  keyboardHeight = 0,
  preferredMaxHeight = 280,
  gap = DEFAULT_GAP,
}) => {
  const visibleBottom = windowHeight - keyboardHeight;
  const triggerBottom = pageY + triggerHeight;
  const spaceBelow = visibleBottom - triggerBottom - gap;
  const spaceAbove = pageY - gap;

  const enoughBelow = spaceBelow >= preferredMaxHeight;
  const enoughAbove = spaceAbove >= preferredMaxHeight;

  let position = 'bottom';

  if (enoughBelow) {
    position = 'bottom';
  } else if (enoughAbove) {
    position = 'top';
  } else if (spaceAbove > spaceBelow) {
    position = 'top';
  } else {
    position = 'bottom';
  }

  const available = position === 'top' ? spaceAbove : spaceBelow;
  const maxHeight = Math.min(
    preferredMaxHeight,
    Math.max(available, MIN_MENU_HEIGHT),
  );

  return {
    position,
    maxHeight: Math.floor(maxHeight),
  };
};
