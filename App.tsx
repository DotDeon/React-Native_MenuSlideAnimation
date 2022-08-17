import { Feather, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const THRESHOLD = SCREEN_WIDTH / 3;

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'Home',
    icon: 'home',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Search',
    icon: 'search',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f61',
    title: 'Categories',
    icon: 'th',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Map',
    icon: 'map-marker',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8d-fbd91a297f61',
    title: 'Favourites',
    icon: 'heart',
  },

  {
    id: '58694a0f-3da1-471f-bd96-145571e2d9d72',
    title: 'Settings',
    icon: 'gear',
  },
  {
    id: '58694a0f-3da1-471f-bd96-1455712e29d72',
    title: 'Logout',
    icon: 'sign-out',
  },
];

const Item = ({ title, icon }) => (
  <View style={{ paddingTop: 30, flexDirection: 'row' }}>
    <FontAwesome name={icon} size={20} color="white" />
    <Text
      style={{ color: '#FFF', fontWeight: '800', fontSize: 20, marginLeft: 15 }}
    >
      {title}
    </Text>
  </View>
);

export default function App() {
  const translateX = useSharedValue(0);

  const panGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { x: number }
  >({
    onStart: (_, context) => {
      context.x = translateX.value;
    },
    onActive: (event, context) => {
      // I forgot to wrap the translationX with Math.max in the video :/
      // It must be done in order to clamp the right axis scroll
      translateX.value = Math.max(event.translationX + context.x, 0);
    },
    onEnd: () => {
      if (translateX.value <= THRESHOLD) {
        translateX.value = withTiming(0);
      } else {
        translateX.value = withTiming(SCREEN_WIDTH / 2);
      }
    },
  });

  const rStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH / 2],
      [0, 3],
      Extrapolate.CLAMP
    );

    const borderRadius = interpolate(
      translateX.value,
      [0, SCREEN_WIDTH / 2],
      [0, 15],
      Extrapolate.CLAMP
    );

    return {
      borderRadius,
      transform: [
        { perspective: 100 },
        {
          translateX: translateX.value,
        },
        {
          rotateY: `-${rotate}deg`,
        },
      ],
    };
  }, []);

  const onPress = useCallback(() => {
    if (translateX.value > 0) {
      translateX.value = withTiming(0);
    } else {
      translateX.value = withTiming(SCREEN_WIDTH / 2);
    }
  }, []);

  const renderItem = ({ item }) => <Item title={item.title} icon={item.icon} />;

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}
    >
      <SafeAreaView style={[styles.container, styles.safe]}>
        <StatusBar style="inverted" />
        <View
          style={{
            marginTop: 85,
            marginLeft: 10,
            position: 'absolute',
            zIndex: 0,
          }}
        >
          <Image
            source={require('./assets/logo.png')}
            style={{ width: 120, height: 120 }}
          />
          <FlatList
            data={DATA}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        <PanGestureHandler onGestureEvent={panGestureEvent}>
          <Animated.View
            style={[{ backgroundColor: 'white', flex: 1, zIndex: 10 }, rStyle]}
          >
            <Feather
              name="menu"
              size={32}
              color={BACKGROUND_COLOR}
              style={{ margin: 15, position: 'absolute' }}
              onPress={onPress}
            />
            <View
              style={{
                marginTop: 20, // backgroundColor: '#000',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                zIndex: 5,
              }}
            >
              <Text>Scroll Right to Reveal Menu</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const BACKGROUND_COLOR = '#1e1e23';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  safe: {
    // workaround for the SafeAreaView in Android (use the react-native-safe-area-context package)
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
});
// });
