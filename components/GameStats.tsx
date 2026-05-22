import {View, Text} from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress';
import {MaterialIcons} from "@expo/vector-icons";


const GameStats = () => {
    return (
        <View className="mt-4 rounded-t-xl bg-neutral-300 p-4">

            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-2">
                <View className="flex-row items-center gap-2">
                    <Text className="text-BLUE-500 text-lg font-bold tracking-wide">
                        GAME STATISTIC
                    </Text>
                </View>

                <View
                    className="px-3 py-1 rounded-full items-center flex-row gap-1 bg-red-500/20 border border-red-500/30">
                    <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                    <Text className="text-red-500 text-xs font-semibold">
                        LIVE
                    </Text>
                </View>
            </View>

            {/* Stats Cards - 3 column grid */}
            <View className="flex-row gap-3 mb-4">

                {/* Total Bets */}
                <View className="flex-1 rounded-lg bg-neutral-500 p-3 border border-neutral-300">
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-blue-600"/>
                        <Text className="text-gray-300 text-xs font-medium tracking-wide">
                            TOTAL BETS
                        </Text>
                    </View>
                    <Text className="text-white text-2xl font-bold">
                        124
                    </Text>
                </View>

                {/* Wins */}
                <View className="flex-1 rounded-lg bg-neutral-500 p-3 border border-neutral-300">
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-green-500"/>
                        <Text className="text-gray-300 text-xs font-medium tracking-wide">
                            WINS
                        </Text>
                    </View>
                    <Text className="text-green-400 text-2xl font-bold">
                        78
                    </Text>
                    <View className="absolute top-2 right-2">
                        <MaterialIcons name='arrow-upward' size={13} color='#22c55e'/>
                    </View>
                </View>

                {/* Losses */}
                <View className="flex-1 rounded-lg bg-neutral-500 p-3 border border-neutral-300">
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-red-500"/>
                        <Text className="text-gray-300 text-xs font-medium tracking-wide">
                            LOSSES
                        </Text>
                    </View>
                    <Text className="text-red-400 text-2xl font-bold">
                        46
                    </Text>
                    <View className="absolute top-2 right-2">
                        <MaterialIcons name='arrow-downward' size={13} color='#ef4444'/>
                    </View>
                </View>

            </View>

            {/* Bottom Profit Section - Enhanced */}
            <View className="rounded-lg bg-neutral-500 p-4">

                <View className="flex-row items-center justify-between">

                    {/* Left - Profit */}
                    <View className="flex-1">
                        <Text className="text-gray-300 text-xs font-medium tracking-wide mb-1">
                            TOTAL PROFIT
                        </Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-green-400 text-3xl font-bold">
                                +$12,450
                            </Text>
                            <Text className="text-green-500/60 text-xs font-bold ml-1">
                                ↑ 8.2%
                            </Text>
                        </View>

                        {/*progress bar*/}
                        <View className="mt-2">
                            <Progress.Bar
                                progress={0.75}
                                width={null}
                                height={4}
                                borderWidth={0}
                                borderRadius={10}
                                color="#22c55e"
                                unfilledColor="#404040"
                                animated
                                animationType="timing"
                            />
                        </View>

                    </View>

                    {/* Divider */}
                    <View className="w-px h-12 bg-neutral-600 mx-4"/>

                    {/* Right - Win Rate */}
                    <View className="items-end">
                        <Text className="text-gray-300 text-xs font-medium tracking-wide mb-1">
                            WIN RATE
                        </Text>
                        <View className="relative">
                            <Text className="text-white text-3xl font-bold">
                                62%
                            </Text>
                            <View
                                className="absolute -top-1 -right-6 w-6 h-6 rounded-full items-center justify-center bg-neutral-800">
                                <MaterialIcons name="check-circle" size={20} color="#4ade80"/>
                            </View>
                        </View>
                        <View className="mt-2 px-2 py-0.5 rounded-full bg-green-500/10">
                            <Text className="text-green-400 text-[10px] font-semibold">
                                +2% vs last 24 hours
                            </Text>
                        </View>
                    </View>

                </View>

            </View>
        </View>
    )
}
export default GameStats
