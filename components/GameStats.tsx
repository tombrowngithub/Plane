import {View, Text} from 'react-native'
import React from 'react'
import * as Progress from 'react-native-progress';
import {MaterialIcons} from "@expo/vector-icons";

type Props = {
    totalBets: number;
    totalWins: number;
    totalLosses: number;
    totalProfit: number;
    winRate: number;
    profitGrowth: number;
};


const GameStats = ({totalBets, totalWins, totalLosses, totalProfit, winRate,profitGrowth}: Props) => {    return (
        <View className="mt-4 rounded-t-xl bg-slate-100 p-4">

            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-2">
                <View className="flex-row items-center gap-2">
                    <Text className="text-slate-900 text-lg font-bold tracking-wide">
                        GAME STATISTIC
                    </Text>
                </View>

                <View
                    className="px-3 py-1 rounded-full items-center flex-row gap-1 bg-rose-50 border border-rose-200">
                    <View className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"/>
                    <Text className="text-rose-600 text-xs font-semibold">
                        LIVE
                    </Text>
                </View>
            </View>

            {/* Stats Cards - 3 column grid */}
            <View className="flex-row gap-3 mb-4">

                {/* Total Bets */}
                <View className="flex-1 rounded-lg bg-white p-3 border border-slate-200">
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-sky-600"/>
                        <Text className="text-slate-500 text-xs font-medium tracking-wide">
                            TOTAL BETS
                        </Text>
                    </View>
                    <Text className="text-slate-900 text-2xl font-bold">
                        {totalBets}
                    </Text>
                </View>

                {/* Wins */}
                <View className="flex-1 rounded-lg bg-white p-3 border border-slate-200">
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-emerald-600"/>
                        <Text className="text-slate-500 text-xs font-medium tracking-wide">
                            WINS
                        </Text>
                    </View>
                    <Text className="text-emerald-700 text-2xl font-bold">
                        {totalWins}
                    </Text>
                    <View className="absolute top-2 right-2">
                        <MaterialIcons name='arrow-upward' size={13} color='#047857'/>
                    </View>
                </View>

                {/* Losses */}
                <View className="flex-1 rounded-lg bg-white p-3 border border-slate-200">
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-rose-600"/>
                        <Text className="text-slate-500 text-xs font-medium tracking-wide">
                            LOSSES
                        </Text>
                    </View>
                    <Text className="text-rose-700 text-2xl font-bold">
                        {totalLosses}
                    </Text>
                    <View className="absolute top-2 right-2">
                        <MaterialIcons name='arrow-downward' size={13} color='#BE123C'/>
                    </View>
                </View>

            </View>

            {/* Bottom Profit Section - Enhanced */}
            <View className="rounded-lg bg-white p-4">

                <View className="flex-row items-center justify-between">

                    {/* Left - Profit */}
                    <View className="flex-1">
                        <Text className="text-slate-500 text-xs font-medium tracking-wide mb-1">
                            TOTAL PROFIT
                        </Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className={`text-3xl font-bold ${
                                totalProfit >= 0
                                    ? 'text-emerald-700'
                                    : 'text-rose-700'
                            }`}>
                                {totalProfit >= 0 ? '+' : '-'}
                                ${Math.abs(totalProfit).toFixed(0)}
                            </Text>
                            <View className="flex-row items-center ml-1 gap-0.5">

                                <MaterialIcons
                                    name={
                                    profitGrowth >= 0 ? 'arrow-upward' : 'arrow-downward'}
                                    size={12}
                                    color={profitGrowth >= 0 ? '#059669' : '#E11D48'}
                                />

                                <Text
                                    className={`text-xs font-bold ${
                                        profitGrowth >= 0 ? 'text-emerald-600/70' : 'text-rose-600/70'}`}
                                >
                                    {Math.abs(profitGrowth).toFixed(1)}%
                                </Text>

                            </View>
                        </View>

                        {/*progress bar*/}
                        <View className="mt-2">
                            <Progress.Bar
                                progress={winRate / 100}
                                width={null}
                                height={4}
                                borderWidth={0}
                                borderRadius={10}
                                color="#047857"
                                unfilledColor="#E2E8F0"
                                animated
                                animationType="timing"
                            />
                        </View>

                    </View>

                    {/* Divider */}
                    <View className="w-px h-12 bg-slate-200 mx-4"/>

                    {/* Right - Win Rate */}
                    <View className="items-end">
                        <Text className="text-slate-500 text-xs font-medium tracking-wide mb-1">
                            WIN RATE
                        </Text>
                        <View className="relative">
                            <Text className="text-slate-900 text-3xl font-bold">
                                {winRate}%
                            </Text>
                            <View
                                className="absolute -top-1 -right-6 w-6 h-6 rounded-full items-center justify-center bg-emerald-50">
                                <MaterialIcons name="check-circle" size={20} color="#059669"/>
                            </View>
                        </View>
                        <View className="mt-2 px-2 py-0.5 rounded-full bg-emerald-50">
                            <Text className="text-emerald-700 text-[10px] font-semibold">
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
