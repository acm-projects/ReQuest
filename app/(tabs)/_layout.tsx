import { Tabs } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useAuth } from '@/AuthContext';
import { PointsProvider } from '../PointsContext';
import CustomLoadingIndicator from '../CustomLoadingIndicator';
import Svg, { Path } from 'react-native-svg';
import tw from 'twrnc';
import TabBar from "../../components/TabBar";
import { useFonts } from 'expo-font';
import * as Font from 'expo-font';

export default function TabLayout() {
  const { signedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [fontsLoaded] = useFonts({
    'Nerko-One': require('../../assets/fonts/NerkoOne-Regular.ttf'),
    'Gilroy': require('../../assets/fonts/Gilroy-Regular.otf'),
  });
  const screenWidth = Dimensions.get('screen').width;

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(loadingTimeout);
  }, []);

  const handleLoadingComplete = () => {
    setShowContent(true);
  };

  const renderArchedText = () => {
    const welcomeText = "Welcome to";
    const arcRadius = 45;
    const totalAngle = Math.PI;
    const charAngleStep = totalAngle / (welcomeText.length - 1);

    return (
      <View style={styles.archContainer}>
        {welcomeText.split('').map((char, index) => {
          const angle = (index - (welcomeText.length - 1) / 2) * charAngleStep;
          const rotateAngle = `${angle * (180 / Math.PI)}deg`;

          return (
            <Text
              key={index}
              style={[
                styles.archText,
                {
                  transform: [
                    { rotate: rotateAngle },
                    { translateY: -arcRadius }
                  ],
                },
              ]}
            >
              {char}
            </Text>
          );
        })}
      </View>
    );
  };

  if (!showContent) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoadingIndicator
          imageSource={require('../../assets/images/recycleEarth.png')}
          width={200}
          height={200}
          isLoading={isLoading}
          onExitComplete={handleLoadingComplete}
          direction="top-to-bottom"
          duration={1500}
        />
      </View>
    );
  }

  if (signedIn) {
    return (
      <PointsProvider>
        <Tabs tabBar={props => <TabBar {...props} />}>
          <Tabs.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />
          <Tabs.Screen
            name="items"
            options={{ title: "Items", headerShown: false }}
          />
          <Tabs.Screen
            name="map"
            options={{ title: "Map", headerShown: false }}
          />
          <Tabs.Screen
            name="profile"
            options={{ title: "Profile", headerShown: false }}
          />
        </Tabs>
      </PointsProvider>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSection}>
        <Image
          source={require('../../assets/images/greenTopLeft.png')}
          style={styles.topLeftImg}
        />
        <Image
          source={require('../../assets/images/greenTopRight.png')}
          style={styles.topRightImg}
        />
        
        {renderArchedText()}
        <Text style={[tw`text-8xl font-bold text-[#6B8068] tracking-wide mt-55`, { fontFamily: 'Nerko-One'}]}>ReQuest!</Text>
        <Text style={[tw`text-4xl font-bold text-white mt-5`, {fontFamily: 'Gilroy'}]}>Reduce, Reuse, Recycle.</Text>
        <Text style={[tw`text-4xl font-bold text-white mt-4`, {fontFamily: 'Gilroy'}]}>The Power is Yours!</Text>
      </SafeAreaView>
      <View>
        <Svg
          height={97}
          width={screenWidth}
          viewBox="0 0 1440 320"
        >
          <Path
            fill="#fffbf1"
            d='M0,160L30,133.3C60,107,120,53,180,48C240,43,300,85,360,133.3C420,181,480,235,540,266.7C600,299,660,309,720,277.3C780,245,840,171,900,160C960,149,1020,203,1080,229.3C1140,256,1200,256,1260,245.3C1320,235,1380,213,1410,202.7L1440,192L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z'
          />
        </Svg>
      </View>
      <View style={styles.bottomSection}>
        <Image
          source={require('../../assets/images/recycleEarth.png')}
          style={styles.earthImg}
        />
        <Image
          source={require('../../assets/images/lightBottomLeft.png')}
          style={styles.bottomLeftImg}
        />
        <Image
          source={require('../../assets/images/lightBottomRight.png')}
          style={styles.bottomRightImg}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('../signup')}
          >
            <Text style={[tw`text-black text-center text-lg`,{fontFamily: 'Gilroy'}]}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('../login')}
          >
            <Text style={[tw`text-black text-center text-lg`,{fontFamily: 'Gilroy'}]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C2D5BA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#728A68',
  },
  topSection: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  curvedPartition: {
    position: 'absolute',
    top: '40%', 
  },
  bottomSection: {
    flex: 0.6,
    backgroundColor: '#fffbf1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30, 
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 30,
    position: 'absolute',
    bottom: 75,
  },
  button: {
    backgroundColor: '#C2D5BA',
    padding: 12,
    borderRadius: 10,
    width: 150,
    marginHorizontal: 10,
  },
  archContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -215,
  },
  archText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  earthImg: {
    width: 300,
    height: 300,
    marginBottom: 150,
  },
  topLeftImg: {
    position: 'absolute',
    top: -40,
    left: -25,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  topRightImg: {
    position: 'absolute',
    top: -22,
    right: -50,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  bottomLeftImg: {
    position: 'absolute',
    bottom: -48,
    left: -69,
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  bottomRightImg: {
    position: 'absolute',
    bottom: -49,
    right: -39,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
