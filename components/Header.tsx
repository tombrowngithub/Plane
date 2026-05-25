import {View, Text, TouchableOpacity, FlatList} from 'react-native'
import {Image} from 'expo-image'
import React from 'react'
import {MaterialIcons} from "@expo/vector-icons";



const getCrashStyles = (value: number) => {

    if (value < 2) {
        return {
            text: 'text-rose-600',
            bg: 'bg-rose-50',
        };
    }

    if (value < 6) {
        return {
            text: 'text-amber-600',
            bg: 'bg-amber-50',
        };
    }

    if (value < 21) {
        return {
            text: 'text-emerald-600',
            bg: 'bg-emerald-50',
        };
    }

    return {
        text: 'text-violet-600',
        bg: 'bg-violet-50',
    };
};

type HeaderProps = {
    onMenuPress: () => void;
    crashHistory: number[];
    balance: number;
}

const Header = ({onMenuPress, crashHistory, balance}: HeaderProps) => {
    return (

            <View className="w-full px-3">

                <View className="flex-row items-center justify-between py-2">
                    <Text className="text-slate-800 border-2 py-1 px-3 rounded-lg border-sky-600 bg-white font-semibold">Balance:
                        ${balance.toLocaleString()}</Text>

                    <Image
                        style={{width: 150, height: 50, marginRight: 20}}
                        contentFit='contain'
                        source={require("../assets/images/JetplaneLogo.png")}/>

                    <TouchableOpacity onPress={onMenuPress}>
                        <MaterialIcons name="menu" size={30} color="#0F172A"/>
                    </TouchableOpacity>
                </View>

                <View>
                    <FlatList
                        data={crashHistory}
                        horizontal
                        showsHorizontalScrollIndicator={false}

                        renderItem={({item}) => {

                            const styles = getCrashStyles(item);

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
