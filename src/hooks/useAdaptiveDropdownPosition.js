import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';

import { computeAdaptiveDropdownPlacement } from '../utils/adaptiveDropdownPlacement';

const DEFAULT_MAX_HEIGHT = 280;

/**
 * Measures a dropdown trigger and returns upward/downward placement + scrollable maxHeight.
 */
const useAdaptiveDropdownPosition = ({
  preferredMaxHeight = DEFAULT_MAX_HEIGHT,
} = {}) => {
  const triggerRef = useRef(null);
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [placement, setPlacement] = useState({
    position: 'bottom',
    maxHeight: preferredMaxHeight,
  });

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const measurePlacement = useCallback(() => {
    const node = triggerRef.current;
    if (!node?.measureInWindow) return;

    node.measureInWindow((_x, pageY, _width, triggerHeight) => {
      setPlacement(
        computeAdaptiveDropdownPlacement({
          pageY,
          triggerHeight,
          windowHeight,
          keyboardHeight,
          preferredMaxHeight,
        }),
      );
    });
  }, [windowHeight, keyboardHeight, preferredMaxHeight]);

  useEffect(() => {
    measurePlacement();
  }, [measurePlacement]);

  const onTriggerLayout = useCallback(() => {
    measurePlacement();
  }, [measurePlacement]);

  const onDropdownFocus = useCallback(() => {
    measurePlacement();
  }, [measurePlacement]);

  return {
    triggerRef,
    dropdownPosition: placement.position,
    maxHeight: placement.maxHeight,
    onTriggerLayout,
    onDropdownFocus,
  };
};

export default useAdaptiveDropdownPosition;
