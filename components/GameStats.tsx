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
    isDarkMode: boolean;
};


const GameStats = ({totalBets, totalWins, totalLosses, totalProfit, winRate, profitGrowth, isDarkMode}: Props) => {

    const containerClass = isDarkMode ? 'bg-[#252c50]' : 'bg-slate-100';
    const titleClass = isDarkMode ? 'text-slate-50' : 'text-slate-900';
    const liveBadgeClass = isDarkMode ? 'bg-rose-500/15 border border-rose-400/30' : 'bg-rose-50 border border-rose-200';
    const liveTextClass = isDarkMode ? 'text-rose-300' : 'text-rose-600';
    const cardClass = isDarkMode ? 'bg-[#30385f] border border-[#3d466f]' : 'bg-white border border-slate-200';
    const mutedTextClass = isDarkMode ? 'text-slate-300' : 'text-slate-500';
    const primaryTextClass = isDarkMode ? 'text-slate-50' : 'text-slate-900';
    const winTextClass = isDarkMode ? 'text-emerald-300' : 'text-emerald-700';
    const lossTextClass = isDarkMode ? 'text-rose-300' : 'text-rose-700';
    const dividerClass = isDarkMode ? 'bg-[#3d466f]' : 'bg-slate-200';
    const successBadgeClass = isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-50';
    const successIconColor = isDarkMode ? '#34D399' : '#059669';
    const lossIconColor = isDarkMode ? '#FB7185' : '#BE123C';
    const profitGrowthColor = profitGrowth >= 0 ? successIconColor : (isDarkMode ? '#FB7185' : '#E11D48');
    const progressTrackColor = isDarkMode ? '#3D466F' : '#E2E8F0';

    return (
        <View className={`mt-4 rounded-t-xl p-4 ${containerClass}`}>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-2">
                <View className="flex-row items-center gap-2">
                    <Text className={`${titleClass} text-lg font-bold tracking-wide`}>
                        GAME STATISTIC
                    </Text>
                </View>

                <View
                    className={`px-3 py-1 rounded-full items-center flex-row gap-1 ${liveBadgeClass}`}>
                    <View className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"/>
                    <Text className={`${liveTextClass} text-xs font-semibold`}>
                        LIVE
                    </Text>
                </View>
            </View>

            {/* Stats Cards - 3 column grid */}
            <View className="flex-row gap-3 mb-4">

                {/* Total Bets */}
                <View className={`flex-1 rounded-lg p-3 ${cardClass}`}>
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-sky-600"/>
                        <Text className={`${mutedTextClass} text-xs font-medium tracking-wide`}>
                            TOTAL BETS
                        </Text>
                    </View>
                    <Text className={`${primaryTextClass} text-2xl font-bold`}>
                        {totalBets}
                    </Text>
                </View>

                {/* Wins */}
                <View className={`flex-1 rounded-lg p-3 ${cardClass}`}>
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-emerald-600"/>
                        <Text className={`${mutedTextClass} text-xs font-medium tracking-wide`}>
                            WINS
                        </Text>
                    </View>
                    <Text className={`${winTextClass} text-2xl font-bold`}>
                        {totalWins}
                    </Text>
                    <View className="absolute top-2 right-2">
                        <MaterialIcons name='arrow-upward' size={13} color={successIconColor}/>
                    </View>
                </View>

                {/* Losses */}
                <View className={`flex-1 rounded-lg p-3 ${cardClass}`}>
                    <View className="flex-row items-center gap-1 mb-2">
                        <View className="w-2.5 h-2.5 rounded-full bg-rose-600"/>
                        <Text className={`${mutedTextClass} text-xs font-medium tracking-wide`}>
                            LOSSES
                        </Text>
                    </View>
                    <Text className={`${lossTextClass} text-2xl font-bold`}>
                        {totalLosses}
                    </Text>
                    <View className="absolute top-2 right-2">
                        <MaterialIcons name='arrow-downward' size={13} color={lossIconColor}/>
                    </View>
                </View>

            </View>

            {/* Bottom Profit Section - Enhanced */}
            <View className={`rounded-lg p-4 ${cardClass}`}>

                <View className="flex-row items-center justify-between">

                    {/* Left - Profit */}
                    <View className="flex-1">
                        <Text className={`${mutedTextClass} text-xs font-medium tracking-wide mb-1`}>
                            TOTAL PROFIT
                        </Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className={`text-3xl font-bold ${
                                totalProfit >= 0
                                    ? winTextClass
                                    : lossTextClass
                            }`}>
                                {totalProfit >= 0 ? '+' : '-'}
                                ${Math.abs(totalProfit).toFixed(0)}
                            </Text>
                            <View className="flex-row items-center ml-1 gap-0.5">

                                <MaterialIcons
                                    name={
                                        profitGrowth >= 0 ? 'arrow-upward' : 'arrow-downward'}
                                    size={12}
                                    color={profitGrowthColor}
                                />

                                <Text
                                    className={`text-xs font-bold ${
                                        profitGrowth >= 0
                                            ? isDarkMode ? 'text-emerald-300/80' : 'text-emerald-600/70'
                                            : isDarkMode ? 'text-rose-300/80' : 'text-rose-600/70'}`}
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
                                unfilledColor={progressTrackColor}
                                animated
                                animationType="timing"
                            />
                        </View>

                    </View>

                    {/* Divider */}
                    <View className={`w-px h-12 ${dividerClass} mx-4`}/>

                    {/* Right - Win Rate */}
                    <View className="items-end">
                        <Text className={`${mutedTextClass} text-xs font-medium tracking-wide mb-1`}>
                            WIN RATE
                        </Text>
                        <View className="relative">
                            <Text className={`${primaryTextClass} text-3xl font-bold`}>
                                {winRate}%
                            </Text>
                            <View
                                className={`absolute -top-1 -right-6 w-6 h-6 rounded-full items-center justify-center ${successBadgeClass}`}>
                                <MaterialIcons name="check-circle" size={20} color={successIconColor}/>
                            </View>
                        </View>
                        <View className={`mt-2 px-2 py-0.5 rounded-full ${successBadgeClass}`}>
                            <Text className={`${winTextClass} text-[10px] font-semibold`}>
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
