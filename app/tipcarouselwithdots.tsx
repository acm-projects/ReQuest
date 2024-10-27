import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import tw from 'twrnc';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';



const { width } = Dimensions.get('window');

const TipsCarouselWithDots = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const [fontsLoaded] = useFonts({
    'Nerko-One': require('../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../assets/fonts/Gilroy-Regular.otf'),
  });

  // 4. useEffect for splash screen
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  // 5. useCallback for layout
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  

  const tipsAndGuides = [
    {
      title: "Tip 1: Reduce Plastic Use",
      description: "Try to use reusable bags and bottles to minimize plastic waste.",
      link: "https://www.youtube.com/embed/CSaUzORm8s8",
    },
    {
      title: "Tip 2: Recycle Properly",
      description: "Make sure to clean and sort your recyclables correctly.",
      link: "https://www.youtube.com/embed/jsp7mgYv3aI",
    },
    {
      title: "Tip 3: Compost Organic Waste",
      description: "Consider composting food scraps and yard waste to reduce landfill waste.",
      link: "https://www.youtube.com/embed/zy70DAaeFBI",
    },
    {
      title: "Tip 4: Saving Water Use",
      description: "Fix leaks and use water-efficient fixtures to conserve water.",
      link: "https://www.youtube.com/embed/5J3cw4biWWo",
    },
    {
      title: "Tip 5: Reduce Food Waste",
      description: "Plan meals and use leftovers to minimize food waste.",
      link: "https://www.youtube.com/embed/ishA6kry8nc",
    },
  ];

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  const contentOffsetX = event.nativeEvent.contentOffset.x;
  const currentIndex = Math.round(contentOffsetX / width); // Calculate the current index based on the scroll position
  setActiveIndex(currentIndex);
};

useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: width * 0.05, animated: false });
    }
  }, []);

  return (
       <View style={tw`flex-1 bg-amber-50`}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollView,
          tw`p-15 mt-15`,
          { 
            alignItems: 'center', 
            paddingBottom: 0,
            paddingHorizontal: width,
          }
        ]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width * 0.9}
        snapToAlignment="center"
        style={{ width: width }}
      >
        {tipsAndGuides.map((tip, index) => (
          <View
            key={index}
            style={[
              tw`p-4 m-2 rounded-3xl`,
              {
                width: width * 0.9,
                backgroundColor: '#DCF8C6',
                alignItems: 'center',
                justifyContent: 'center', // Added for vertical centering
              }
            ]}
          >
            <Text 
              style={[
                tw`text-2xl font-bold mt-1 text-center`, // Added text-center
                { 
                  color: '#400908',
                  fontFamily: 'Nerko-One',
                  textAlign: 'center', // Ensures text is centered
                  width: '100%' // Ensures text takes full width for proper centering
                }
              ]}
            >
              {tip.title}
            </Text>
            <Text 
              style={[
                tw`text-base mb-2 text-center`, // Added text-center
                { 
                  color: '#400908',
                  fontFamily: 'Nerko-One',
                  textAlign: 'center', // Ensures text is centered
                  width: '100%' // Ensures text takes full width for proper centering
                }
              ]}
            >
            </Text>
            <WebView
              source={{ uri: tip.link }}
              style={[tw`w-55 h-60`, { alignSelf: 'center' }]} // Added alignSelf: 'center'
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
            />
          </View>
        ))}
      </ScrollView>

      <View style={[tw`absolute bottom-66 w-full flex-row justify-center`, { left: 0, right: 0 }]}>
        {tipsAndGuides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: 20,
    flexGrow: 1,
    marginTop: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#400908',
  },
  inactiveDot: {
    backgroundColor: '#C0C0C0',
  },
});
export default TipsCarouselWithDots;
