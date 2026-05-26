import React, {useEffect, useRef} from 'react';
import {Dimensions, View, Text} from 'react-native';
import {Image} from 'expo-image';

import Animated, {
    cancelAnimation,
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const DISPLAY_HEIGHT = 200;
const PLANE_WIDTH = 180;
const PLANE_HEIGHT = 90;
const PLANE_START_X = -15;
const PLANE_START_Y = DISPLAY_HEIGHT - PLANE_HEIGHT + 20;
const PLANE_END_X = SCREEN_WIDTH - PLANE_WIDTH;
const PLANE_END_Y = 20;
const BACKGROUND_LOOP_DURATION = 2500; //I need to find a way to increase the speed when odds are above 3, from this 2500 down to 500
const FLIGHT_DURATION = 6000;
const RETURN_DURATION = 100;

const PLANE_IMAGES = {
    idle: require('../assets/images/planeIdle.png'),
    flying: require('../assets/images/planeFlying.png'),
    exploded: require('../assets/images/planeExplodes.png'),
};


type FlightDisplayScreenProps = {
    multiplier: number;
    status: 'waiting' | 'playing' | 'crashed' | 'cashed';
    countdown: number | null;
};

const FlightDisplayScreen = ({multiplier, status, countdown}: FlightDisplayScreenProps) => {

    const flightProgress = useSharedValue(0);

    const backgroundTranslateX = useSharedValue(0);





    const planeImage = (() => {

        switch (status) {

            case 'playing':
                return PLANE_IMAGES.flying;

            case 'crashed':
                return PLANE_IMAGES.exploded;

            default:
                return PLANE_IMAGES.idle;
        }

    })();


    useEffect(() => {
        cancelAnimation(backgroundTranslateX);
        cancelAnimation(flightProgress);

        if (status === 'playing') {
            backgroundTranslateX.value = 0;
            flightProgress.value = 0;

            backgroundTranslateX.value = withRepeat(
                withTiming(-SCREEN_WIDTH, {
                    duration: BACKGROUND_LOOP_DURATION,
                    easing: Easing.linear,
                }),
                -1,
                false,
            );

            flightProgress.value = withTiming(1, {
                duration: FLIGHT_DURATION,
                easing: Easing.out(Easing.ease),
            });


            return () => {
                cancelAnimation(backgroundTranslateX);
                cancelAnimation(flightProgress);
            };
        }

        if (status === 'waiting') {
            backgroundTranslateX.value = withTiming(0, {
                duration: RETURN_DURATION,
                easing: Easing.out(Easing.ease),
            });

            flightProgress.value = withTiming(0, {
                duration: RETURN_DURATION,
                easing: Easing.out(Easing.ease),
            });
        }

        return () => {
            cancelAnimation(backgroundTranslateX);
            cancelAnimation(flightProgress);
        };
    }, [backgroundTranslateX, flightProgress, status]);

    const animatedBackgroundStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: backgroundTranslateX.value,
                },
            ],
        };
    });

    const animatedPlaneStyle = useAnimatedStyle(() => {

        const translateX = interpolate(
            flightProgress.value,
            [0, 1],
            [PLANE_START_X, PLANE_END_X],
        );

        const translateY = interpolate(
            flightProgress.value,
            [0, 1],
            [PLANE_START_Y, PLANE_END_Y],
        );

        const rotate = interpolate(
            flightProgress.value,
            [0, 1],
            [0, -18],
        );

        return {
            position: 'absolute',
            transform: [
                {translateX},
                {translateY},
                {rotate: `${rotate}deg`},
            ],
        };
    });

    return (
        <View className="w-full h-[200px] mt-4 overflow-hidden bg-sky-100 relative">
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        flexDirection: 'row',
                        width: SCREEN_WIDTH * 2,
                        height: '100%',
                    },
                    animatedBackgroundStyle,
                ]}
            >

                <Image
                    source={require('../assets/images/cloudBg.png')}
                    contentFit="cover"
                    style={{
                        width: SCREEN_WIDTH,
                        height: '100%',
                    }}
                />

                <Image
                    source={require('../assets/images/cloudBg.png')}
                    contentFit="cover"
                    style={{
                        width: SCREEN_WIDTH,
                        height: '100%',
                    }}
                />

            </Animated.View>

            <Animated.View style={animatedPlaneStyle}>
                <Image
                    source={planeImage}
                    contentFit="contain"
                    style={{
                        width: PLANE_WIDTH,
                        height: PLANE_HEIGHT,
                    }}
                />
            </Animated.View>

            {/*Time counter and odds multiplier display*/}
            <View
                className="w-28 h-28 bg-slate-500/50 rounded-full right-0 bottom-0 items-center justify-center absolute">
                {status === 'waiting' ?
                    <Text className="text-4xl font-bold">
                        {countdown}
                    </Text>
                    :
                    <Text className="text-3xl font-bold">
                        {multiplier.toFixed(2)}x
                    </Text>}


            </View>
        </View>
    );
};

export default FlightDisplayScreen;
