import {useEffect, useState} from "react";
import {Text, TextInput, TouchableOpacity, View, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from "@/components/Header";
import {MaterialIcons} from "@expo/vector-icons";
import CustomModal from "@/components/CustomModal";
import GameStats from "@/components/GameStats";
import FlightDisplayScreen from "@/components/FlightDisplayScreen";
import SideBar from "@/components/SideBar";
import {GameState} from "@/types/game";
import {socket} from '@/services/socket';


const Index = () => {
    const [showAutoplayModal, setShowAutoplayModal] = useState(false);
    /*const [flightStatus, setFlightStatus] = useState<FlightDisplayState>('idle');
    const [flightRunId, setFlightRunId] = useState(0);*/
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [gameState, setGameState] = useState<GameState>({
        multiplier: 1,
        status: 'waiting',
        countdown: null,
        crashPoint: null,
        cashoutMultiplier: null,
    });

    /*const handleStartPlane = () => {
        setFlightStatus('flying');
        setFlightRunId((currentRunId) => currentRunId + 1);
    };*/

    useEffect(() => {

        socket.on('update', (data) => {

            const multiplier = parseFloat(data.multiplier);

            setGameState(prev => ({
                ...prev,
                multiplier,
                status: 'playing',
            }));
        });

        socket.on('crash', (data) => {

            const crashPoint = parseFloat(data.crashPoint);

            setGameState(prev => ({
                ...prev,
                multiplier: crashPoint,
                status: 'crashed',
                crashPoint,
            }));
        });

        socket.on('cashedOut', (data) => {

            const cashoutMultiplier = parseFloat(data.multiplier);

            setGameState(prev => ({
                ...prev,
                status: 'cashed',
                cashoutMultiplier,
            }));
        });

        socket.on('countdown', (data) => {

            setGameState({
                multiplier: 1,
                status: 'waiting',
                countdown: data.countdown,
                crashPoint: null,
                cashoutMultiplier: null,
            });
        });

        return () => {
            socket.off('update');
            socket.off('crash');
            socket.off('cashedOut');
            socket.off('countdown');
        };

    }, []);

    const handlePlaceAutobet = (betData: any) => {
        console.log('Autobet placed:', betData);
        // Handle the autobet logic here
        // Example: call your API, update state, etc.
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">

            <Header onMenuPress={() => setIsSidebarOpen(true)} />

            <SideBar
                visible={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/*Animating flying plane section*/}
            <FlightDisplayScreen
                multiplier={gameState.multiplier}
                status={gameState.status}
                countdown={gameState.countdown}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}

            >

                {/*This will be temporal component to test out the 3 states of the plane. It will be removed when we start the backend implementation*/}
                {/*<View className="p-4 bg-gray-400 items-center justify-between flex-row">
                    <TouchableOpacity onPress={handleStartPlane}>
                        <Text>Start</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setFlightStatus('idle')}>
                        <Text>Stop</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setFlightStatus('exploded')}>
                        <Text>Explode</Text>
                    </TouchableOpacity>
                </View>*/}


                {/*Place a bet section*/}
                <View className="w-full mt-2 p-1 gap-3">

                    <View className="w-full flex-row gap-2 rounded-md bg-slate-200 p-2">

                        {/* LEFT SIDE */}
                        <View className="flex-1 gap-2">

                            {/* INPUT */}
                            <View className="flex-row items-center rounded-md bg-white px-3 py-1">
                                <TextInput
                                    placeholder="10"
                                    keyboardType="numeric"
                                    className="flex-1 text-slate-800 font-semibold"
                                    placeholderTextColor="#64748B"
                                />

                                <TouchableOpacity>
                                    <MaterialIcons name="close" size={18} color="#64748B"/>
                                </TouchableOpacity>
                            </View>

                            {/* QUICK AMOUNTS */}
                            <View className="gap-2">

                                <View className="flex-row gap-2">
                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">10</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">50</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">100</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row gap-2">
                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">200</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">500</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">1000</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>

                        {/* RIGHT SIDE */}
                        <View className="w-[120px] gap-2">

                            {/* AUTOPLAY */}
                            <TouchableOpacity
                                onPress={() => setShowAutoplayModal(true)}
                                className="py-[14.5px] rounded-md border border-sky-600 items-center justify-center">
                                <Text
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    className="text-sky-700 font-bold text-[11px]"
                                >
                                    ENABLE AUTOPLAY
                                </Text>
                            </TouchableOpacity>

                            {/* PLACE BET {/*Placebet would dynamically serve as cashout button if the user placed a bet and it running* */}
                            <TouchableOpacity
                                className="flex-1 rounded-md bg-sky-600 items-center justify-center px-2">
                                <Text className="text-white font-bold text-base">
                                    PLACE A BET
                                </Text>

                                {/*<Text className="text-white text-[10px] opacity-80">
                            on the next round
                        </Text>*/}
                            </TouchableOpacity>

                        </View>

                    </View>

                    <View className="w-full flex-row gap-2 rounded-md bg-slate-200 p-2">

                        {/* LEFT SIDE */}
                        <View className="flex-1 gap-2">

                            {/* INPUT */}
                            <View className="flex-row items-center rounded-md bg-white px-3 py-1">
                                <TextInput
                                    placeholder="10"
                                    keyboardType="numeric"
                                    className="flex-1 text-slate-800 font-semibold"
                                    placeholderTextColor="#64748B"
                                />

                                <TouchableOpacity>
                                    <MaterialIcons name="close" size={18} color="#64748B"/>
                                </TouchableOpacity>
                            </View>

                            {/* QUICK AMOUNTS */}
                            <View className="gap-2">

                                <View className="flex-row gap-2">
                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">10</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">50</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">100</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row gap-2">
                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">200</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">500</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity className="flex-1 rounded py-2 bg-slate-100 items-center">
                                        <Text className="text-slate-700 font-semibold">1000</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>

                        {/* RIGHT SIDE */}
                        <View className="w-[120px] gap-2">

                            {/* AUTOPLAY */}
                            <TouchableOpacity
                                onPress={() => setShowAutoplayModal(true)}
                                className="py-[14.5px] rounded-md border border-sky-600 items-center justify-center">
                                <Text
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    className="text-sky-700 font-bold text-[11px]"
                                >
                                    ENABLE AUTOPLAY
                                </Text>
                            </TouchableOpacity>

                            {/* PLACE BET {/*Placebet would dynamically serve as cashout button if the user placed a bet and it running* */}
                            <TouchableOpacity
                                className="flex-1 rounded-md bg-sky-600 items-center justify-center px-2">
                                <Text className="text-white font-bold text-base">
                                    PLACE A BET
                                </Text>

                                {/*<Text className="text-white text-[10px] opacity-80">
                                        on the next round // this will show when the game round has started already
                                  </Text>*/}
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>

                {/* Log of Total Bets, Wins & Losses */}
                <GameStats/>

            </ScrollView>

            <CustomModal
                visible={showAutoplayModal}
                onClose={() => setShowAutoplayModal(false)}
                onPlaceBet={handlePlaceAutobet}
            />

        </SafeAreaView>
    );
};

export default Index;
