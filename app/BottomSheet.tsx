
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  useAnimatedGestureHandler 
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  cart: any[];
  total: number;
  handleRecycle: (item: string) => void;
  navigateToMap: (item: string) => void;
  removeFromCart: (index: number) => void;
  recycledItems: Set<string>;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  cart,
  total,
  handleRecycle,
  navigateToMap,
  removeFromCart,
  recycledItems
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT * 0.25); // Start partially visible

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const newY = ctx.startY + event.translationY;
      translateY.value = Math.min(Math.max(newY, 0), SCREEN_HEIGHT * 0.35);
    },
    onEnd: (event) => {
      const snapPoint = event.velocityY > 0 ? SCREEN_HEIGHT * 0.25 : 0;
      translateY.value = withSpring(snapPoint, {
        damping: 20,
        stiffness: 90,
      });
    },
  });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle]}>
        <View style={styles.handle} />
        <ScrollView style={styles.scrollView}>
          <Text style={styles.cartTitle}>Recycling Cart</Text>
          {cart.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <Text style={styles.itemText}>{item}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    recycledItems.has(item) && styles.disabledButton
                  ]}
                  onPress={() => handleRecycle(item)}
                  disabled={recycledItems.has(item)}
                >
                  <Text style={styles.buttonText}>
                    {recycledItems.has(item) ? 'Recycled' : 'Recycle'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigateToMap(item)}
                >
                  <Text style={styles.buttonText}>Map</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => removeFromCart(index)}
                >
                  <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>Total Points: {total}</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFBF1',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: SCREEN_HEIGHT * 0.5,
    zIndex: 1000,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#728a68',
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#728a68',
    marginBottom: 20,
  },
  cartItem: {
    backgroundColor: '#C2D5BA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between', // Changed from flex-start
  alignItems: 'center',
  width: '100%', // Added to ensure full width
},

  actionButton: {
    backgroundColor: '#728a68',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFBF1',
    fontWeight: 'bold',
  },
 deleteButton: {
  backgroundColor: '#FF5722',
  borderRadius: 15,
  width: 30,
  height: 30,
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 'auto', // This will push it to the right
},

  deleteText: {
    color: '#FFFBF1',
    fontWeight: 'bold',
  },
  pointsContainer: {
    backgroundColor: '#728a68',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  pointsText: {
    color: '#FFFBF1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#A0AFA0',
    opacity: 0.7,
  },
});

export default BottomSheet;
