import React, {useEffect} from 'react';
import {Dimensions, Pressable, Text, Touchable, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets}  from "react-native-safe-area-context";
import {MaterialIcons} from "@expo/vector-icons";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.5;

type SideBarProps = {
    visible: boolean;
    onClose: () => void;
};

const SideBar = ({visible, onClose}: SideBarProps) => {

    const insets = useSafeAreaInsets();

    // sidebar position animation
    const translateX = useSharedValue(SIDEBAR_WIDTH);

    // backdrop opacity animation
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {

        translateX.value = withTiming(
            visible ? 0 : SIDEBAR_WIDTH,
            {
                duration: 300,
            }
        );

        backdropOpacity.value = withTiming(
            visible ? 1 : 0,
            {
                duration: 300,
            }
        );

    }, [backdropOpacity, translateX, visible]);

    // sidebar animation style
    const sidebarAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: translateX.value,
                },
            ],
        };
    });

    // backdrop animation style
    const backdropAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: backdropOpacity.value,
        };
    });

    return (
        <View
            style={{paddingTop: insets.top + 20}}
            pointerEvents={visible ? 'auto' : 'none'}
            className="absolute inset-0 z-50"
        >

            {/* BACKDROP */}
            <Animated.View
                style={backdropAnimatedStyle}
                className="absolute inset-0"
            >
                <Pressable
                    onPress={onClose}
                    className="flex-1 bg-black/40"
                />
            </Animated.View>

            {/* SIDEBAR */}
            <Animated.View
                style={[
                    {
                        width: SIDEBAR_WIDTH,
                        right: 0,
                        top: 0,
                        bottom: insets.bottom,
                        position: 'absolute',
                    },
                    sidebarAnimatedStyle,
                ]}
                className="bg-slate-100/90 p-5"
            >

                <View style={{paddingTop: insets.top + 20}} className="gap-6">
                    <TouchableOpacity className="flex-row items-center p-2 bg-slate-100 rounded-lg">
                        <MaterialIcons name="dark-mode" size={25} color="#334155"/>
                        <Text className="text-gray-600 ml-1 font-semibold">Dark Mode</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-2 bg-slate-100 rounded-lg">
                        <MaterialIcons name="paid" size={25} color="#334155"/>
                        <Text className="text-gray-600 ml-1 font-semibold">Top up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-2 bg-slate-100 rounded-lg">
                        <MaterialIcons name="output" size={25} color="#334155"/>
                        <Text className="text-gray-600 ml-1 font-semibold">Withdraw</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-2 bg-slate-100 rounded-lg">
                        <MaterialIcons name="volume-up" size={25} color="#334155"/>
                        <Text className="text-gray-600 ml-1 font-semibold">Sound On</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-2 bg-slate-100 rounded-lg">
                        <MaterialIcons name="history" size={25} color="#334155"/>
                        <Text className="text-gray-600 ml-1 font-semibold">History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-2 bg-slate-100 rounded-lg">
                        <MaterialIcons name="settings" size={25} color="#334155"/>
                        <Text className="text-gray-600 ml-1 font-semibold">Account Settings</Text>
                    </TouchableOpacity>
                </View>

            </Animated.View>

        </View>
    );
};

export default SideBar;
