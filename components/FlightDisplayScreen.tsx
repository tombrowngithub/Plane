import React, {useEffect} from 'react';
import {Dimensions, View} from 'react-native';
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
const BACKGROUND_LOOP_DURATION = 2500;
const FLIGHT_DURATION = 6000;
const RETURN_DURATION = 100;

const PLANE_IMAGES = {
    idle: require('../assets/images/planeIdle.png'),
    flying: require('../assets/images/planeFlying.png'),
    exploded: require('../assets/images/planeExplodes.png'),
};

export type FlightDisplayState = keyof typeof PLANE_IMAGES;

type FlightDisplayScreenProps = {
    status?: FlightDisplayState;
    runId?: number;
};

const FlightDisplayScreen = ({
    status = 'idle',
    runId = 0,
}: FlightDisplayScreenProps) => {
    const backgroundTranslateX = useSharedValue(0);
    const flightProgress = useSharedValue(0);

    useEffect(() => {
        cancelAnimation(backgroundTranslateX);
        cancelAnimation(flightProgress);

        if (status === 'flying') {
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

        if (status === 'idle') {
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
    }, [backgroundTranslateX, flightProgress, runId, status]);

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
        <View className="w-full h-[200px] mt-4 overflow-hidden bg-sky-100 ">
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
                    source={PLANE_IMAGES[status]}
                    contentFit="contain"
                    style={{
                        width: PLANE_WIDTH,
                        height: PLANE_HEIGHT,
                    }}
                />
            </Animated.View>

        </View>
    );
};

export default FlightDisplayScreen;
