import {View, Text, TouchableOpacity, FlatList} from 'react-native'
import {Image} from 'expo-image'
import React from 'react'
import {MaterialIcons} from "@expo/vector-icons";

const crashHistory = [1.22, 2.60, 1.60, 54.12, 2.81, 10.72, 1.23, 5.44, 5.86, 3.21, 2.22, 1.02, 100.30]
const balance = 5000

const Header = () => {
    return (
        <View className="w-full px-3">

            <View className="flex-row items-center justify-between py-2">
                <Text className="text-slate-800 border-2 py-1 px-3 rounded-lg border-sky-600 bg-white font-semibold">Balance:
                    ${balance.toLocaleString()}</Text>

                <Image
                    style={{width: 150, height: 50, marginRight: 20}}
                    contentFit='contain'
                    source={require("../assets/images/JetplaneLogo.png")}/>

                <TouchableOpacity>
                    <MaterialIcons name="menu" size={30} color="#0F172A"/>
                </TouchableOpacity>
            </View>

            <View>
                <FlatList
                    data={crashHistory}
                    renderItem={({item}) => (
                        <Text className="bg-slate-100 text-slate-700 mr-2 p-2 rounded-lg text-sm shadow">{item}x</Text>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>
        </View>
    )
}
export default Header
