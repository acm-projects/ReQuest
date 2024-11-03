import React, { useRef, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Dimensions, 
  StyleSheet, 
  ViewToken, 
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent 
} from 'react-native';
import WebView from 'react-native-webview';
import tw from 'twrnc';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const DOT_SIZE = 10;
const DOT_SPACING = 10;

// tipcarouselwithdots.tsx
interface TipsCarouselProps {
  tipsAndGuides: {
    title: string;
    description: string;
    link: string;
  }[];
  onIndexChange?: (index: number) => void;
}

const TipsCarouselWithDots: React.FC<TipsCarouselProps> = ({ tipsAndGuides, onIndexChange }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const [fontsLoaded] = useFonts({
    'Nerko-One': require('../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../assets/fonts/Gilroy-Regular.otf'),
  });

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0] && onIndexChange) {
      onIndexChange(viewableItems[0].index || 0);
    }
  }, [onIndexChange]);

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50,
  };

  const renderItem = ({ item }: { item: typeof tipsAndGuides[0] }) => (
    <View
      style={[
        tw`rounded-3xl`,
        {
          width: ITEM_WIDTH,
          marginHorizontal: (width - ITEM_WIDTH) / 2,
          backgroundColor: '#DCF8C6',
          padding: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}
    >
      <Text 
        style={[
          tw`text-2xl font-bold mt-1 text-center`,
          { 
            color: '#400908',
            fontFamily: 'Nerko-One',
            textAlign: 'center',
            width: '100%'
          }
        ]}
      >
        {item.title}
      </Text>
      <Text 
        style={[
          tw`text-base mb-2 text-center`,
          { 
            color: '#400908',
            fontFamily: 'Nerko-One',
            textAlign: 'center',
            width: '100%'
          }
        ]}
      >
        {item.description}
      </Text>
      <WebView
        source={{ uri: item.link }}
        style={[tw`w-55 h-60`, { alignSelf: 'center' }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={tw`flex-1 bg-amber-50`}>
      <FlatList
        ref={flatListRef}
        data={tipsAndGuides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={tw`py-15`}
      />
    </View>
  );
};

export default TipsCarouselWithDots;