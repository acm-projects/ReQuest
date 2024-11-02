import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Image,
  ImageSourcePropType,
  ViewStyle,
  Easing,
} from 'react-native';

type CustomLoadingIndicatorProps = {
  imageSource: ImageSourcePropType;
  width?: number;
  height?: number;
  duration?: number;
  isLoading?: boolean;
  containerStyle?: ViewStyle;
  repeatCount?: number;
  animationType?: 'fill' | 'pulse' | 'wave';
  direction?: 'bottom-to-top' | 'top-to-bottom' | 'left-to-right' | 'right-to-left';
  easingFunction?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
  onExitComplete?: () => void;
};

const CustomLoadingIndicator: React.FC<CustomLoadingIndicatorProps> = ({
  imageSource,
  width = 100,
  height = 100,
  duration = 1500,
  isLoading = true,
  containerStyle,
  repeatCount = -1,
  animationType = 'fill',
  direction = 'top-to-bottom',
  easingFunction = 'ease-in-out',
  onExitComplete,
}) => {
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const wavePosition = useRef(new Animated.Value(0)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const getEasingFunction = (type: string) => {
    switch (type) {
      case 'linear':
        return Easing.linear;
      case 'ease-in':
        return Easing.ease;
      case 'ease-out':
        return Easing.out(Easing.ease);
      case 'ease-in-out':
        return Easing.inOut(Easing.ease);
      case 'bounce':
        return Easing.bounce;
      default:
        return Easing.inOut(Easing.ease);
    }
  };

  const createFillAnimation = () => {
    fillAnimation.setValue(0);
    return Animated.timing(fillAnimation, {
      toValue: 1,
      duration,
      useNativeDriver: false,
      easing: getEasingFunction(easingFunction),
    });
  };

  const createPulseAnimation = () => {
    return Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 0.7,
        duration: duration / 2,
        useNativeDriver: false,
        easing: getEasingFunction(easingFunction),
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: false,
        easing: getEasingFunction(easingFunction),
      }),
    ]);
  };

  const createWaveAnimation = () => {
    wavePosition.setValue(0);
    return Animated.timing(wavePosition, {
      toValue: 1,
      duration,
      useNativeDriver: false,
      easing: Easing.linear,
    });
  };

  const createExitAnimation = () => {
    return Animated.sequence([
      Animated.timing(exitScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(exitScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]);
  };

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (isLoading) {
      exitScale.setValue(1);
      
      switch (animationType) {
        case 'pulse':
          animation = createPulseAnimation();
          break;
        case 'wave':
          animation = createWaveAnimation();
          break;
        default:
          animation = createFillAnimation();
      }

      if (repeatCount === -1) {
        Animated.loop(animation).start();
      } else {
        Animated.loop(animation, { iterations: repeatCount }).start();
      }
    } else {
      createExitAnimation().start(() => {
        onExitComplete?.();
      });
    }

    return () => {
      animation?.stop();
    };
  }, [isLoading, duration, animationType, repeatCount, easingFunction]);

  const getAnimatedStyle = (): Animated.WithAnimatedValue<ViewStyle> => {
    const isVertical = direction.includes('bottom') || direction.includes('top');
    const isReversed = direction.includes('top') || direction.includes('right');

    switch (animationType) {
      case 'pulse':
        return {
          transform: [{ scale: pulseAnimation }] as Animated.WithAnimatedValue<ViewStyle>['transform'],
        };
      case 'wave':
        return {
          transform: [
            isVertical
              ? {
                  translateY: wavePosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, -height],
                  }),
                }
              : {
                  translateX: wavePosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width, -width],
                  }),
                },
          ] as Animated.WithAnimatedValue<ViewStyle>['transform'],
        };
      default:
        if (direction === 'top-to-bottom') {
          return {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: fillAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, height],
            }),
            overflow: 'hidden',
          };
        }
        return {
          height: isVertical
            ? fillAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: isReversed ? [height, 0] : [0, height],
              })
            : height,
          width: !isVertical
            ? fillAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: isReversed ? [width, 0] : [0, width],
              })
            : width,
          overflow: 'hidden',
        };
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { width, height }, 
        containerStyle, 
        { transform: [{ scale: exitScale }] } as Animated.WithAnimatedValue<ViewStyle>
      ]}
    >
      <Image
        source={imageSource}
        style={[styles.baseImage, { width, height, opacity: 0.3 }]}
      />
      <Animated.View style={[styles.fillContainer, getAnimatedStyle()]}>
        <Image source={imageSource} style={[styles.fillImage, { width, height }]} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  baseImage: {
    resizeMode: 'contain',
  },
  fillImage: {
    resizeMode: 'contain',
  },
  fillContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default CustomLoadingIndicator;