import {View, Text, TouchableOpacity, FlatList} from 'react-native'
import {Image} from 'expo-image'
import React from 'react'
import {MaterialIcons} from "@expo/vector-icons";



const getCrashStyles = (value: number, isDarkMode: boolean) => {

    if (value < 2) {
        return {
            text: isDarkMode ? 'text-rose-300' : 'text-rose-600',
            bg: isDarkMode ? 'bg-rose-500/15' : 'bg-rose-50',
        };
    }

    if (value < 6) {
        return {
            text: isDarkMode ? 'text-amber-200' : 'text-amber-600',
            bg: isDarkMode ? 'bg-amber-400/15' : 'bg-amber-50',
        };
    }

    if (value < 21) {
        return {
            text: isDarkMode ? 'text-emerald-300' : 'text-emerald-600',
            bg: isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-50',
        };
    }

    return {
        text: isDarkMode ? 'text-violet-300' : 'text-violet-600',
        bg: isDarkMode ? 'bg-violet-500/15' : 'bg-violet-50',
    };
};

type HeaderProps = {
    onMenuPress: () => void;
    crashHistory: number[];
    balance: number;
    isDarkMode: boolean;
}

const Header = ({onMenuPress, crashHistory, balance, isDarkMode}: HeaderProps) => {
    return (

            <View className="w-full px-3">

                <View className="flex-row items-center justify-between py-2">
                    <Text
                        className={`border-2 py-1 px-3 rounded-lg font-semibold ${
                            isDarkMode
                                ? 'text-slate-100 border-sky-400 bg-[#252c50]'
                                : 'text-slate-800 border-sky-600 bg-white'
                        }`}
                    >
                        Balance:
                        ${balance.toLocaleString()}</Text>

                    <Image
                        tintColor={isDarkMode ? "#fff" : ""}
                        style={{width: 150, height: 50, marginRight: 20}}
                        contentFit='contain'
                        source={require("../assets/images/JetplaneLogo.png")}/>

                    <TouchableOpacity onPress={onMenuPress}>
                        <MaterialIcons name="menu" size={30} color={isDarkMode ? '#E2E8F0' : '#0F172A'}/>
                    </TouchableOpacity>
                </View>

                <View>
                    <FlatList
                        data={crashHistory}
                        horizontal
                        showsHorizontalScrollIndicator={false}

                        renderItem={({item}) => {

                            const styles = getCrashStyles(item, isDarkMode);

                            return (
                                <Text
                                    className={`${styles.bg} ${styles.text} mr-2 px-3 py-2 rounded-lg text-sm font-bold`}
                                >
                                    {item.toFixed(2)}x
                                </Text>
                            );
                        }}
                    />
                </View>
            </View>

    )
}
export default Header
