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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [balance, setBalance] = useState(5000);
    const [bet1, setBet1] = useState({
        amount: '',
        placed: false,
        cashedOut: false,
        profit: 0,
    });

    const [bet2, setBet2] = useState({
        amount: '',
        placed: false,
        cashedOut: false,
        profit: 0,
    });
    const quickAmounts = [10, 50, 100, 200, 500, 1000];
    const [gameState, setGameState] = useState<GameState>({
        multiplier: 1,
        status: 'waiting',
        countdown: null,
        crashPoint: null,
        cashoutMultiplier: null,
    });


    const [crashHistory, setCrashHistory] = useState<number[]>([]);

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

            setCrashHistory(prev => [crashPoint, ...prev]);
            //RESET BET HERE
            setBet1(prev => ({
                ...prev,
                placed: false,
            }));

            setBet2(prev => ({
                ...prev,
                placed: false,
            }));
        });

        socket.on('cashedOut', (data) => {
            console.log('Player cashed out at:', data.multiplier);
        });

        socket.on('countdown', (data) => {

            setGameState({
                multiplier: 1,
                status: 'waiting',
                countdown: data.countdown,
                crashPoint: null,
                cashoutMultiplier: null,
            });

            setBet1(prev => ({
                ...prev,
                cashedOut: false,
                profit: 0,
            }));

            setBet2(prev => ({
                ...prev,
                cashedOut: false,
                profit: 0,
            }));
        });

        return () => {
            socket.off('update');
            socket.off('crash');
            socket.off('cashedOut');
            socket.off('countdown');
        };

    }, []);

    const placeBet = (betNumber: 1 | 2) => {

        const currentBet = betNumber === 1 ? bet1 : bet2;

        const amount = Number(currentBet.amount);

        if (!amount || amount <= 0) return;

        if (amount > balance) return;

        setBalance(prev => {
            const newBalance = prev - amount;
            return newBalance <= 0 ? 5000 : newBalance;
        });

        if (betNumber === 1) {
            setBet1(prev => ({
                ...prev,
                placed: true,
                cashedOut: false,
                profit: 0,
            }));
        } else {
            setBet2(prev => ({
                ...prev,
                placed: true,
                cashedOut: false,
                profit: 0,
            }));
        }
    };

    const cashOut = (betNumber: 1 | 2) => {

        const currentBet = betNumber === 1 ? bet1 : bet2;

        if (!currentBet.placed || currentBet.cashedOut) return;

        const amount = Number(currentBet.amount);

        const profit = amount * gameState.multiplier;

        socket.emit('cashOut');

        setBalance(prev => prev + profit);

        if (betNumber === 1) {
            setBet1(prev => ({
                ...prev,
                placed: false,
                cashedOut: true,
                profit,
            }));
        } else {
            setBet2(prev => ({
                ...prev,
                placed: false,
                cashedOut: true,
                profit,
            }));
        }
    };

    const handlePlaceAutobet = (betData: any) => {
        console.log('Autobet placed:', betData);
        // Handle the autobet logic here
        // Example: call your API, update state, etc.
    };


    const isPlaying = gameState.status === 'playing';


    return (
        <SafeAreaView className="flex-1 bg-slate-50">

            <Header
                onMenuPress={() => setIsSidebarOpen(true)}
                crashHistory={crashHistory}
                balance={balance}
            />

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

                {/*Place a bet section*/}
                <View className="w-full mt-2 p-1 gap-3">

                    <View className="w-full flex-row gap-2 rounded-md bg-slate-200 p-2">

                        {/* LEFT SIDE */}
                        <View className="flex-1 gap-2">

                            {/* INPUT */}
                            <View className="flex-row items-center rounded-md bg-white px-3 py-1">
                                <TextInput
                                    value={bet1.amount}
                                    onChangeText={(text) =>
                                        setBet1(prev => ({
                                            ...prev,
                                            amount: text,
                                        }))
                                    }
                                    placeholder="10"
                                    keyboardType="numeric"
                                    className="flex-1 text-slate-800 font-semibold"
                                    placeholderTextColor="#64748B"
                                />

                                <TouchableOpacity
                                    onPress={() => setBet2(prev => ({
                                        ...prev,
                                        amount: ""
                                    }))}>
                                    <MaterialIcons name="close" size={18} color="#64748B"/>
                                </TouchableOpacity>
                            </View>

                            {/* QUICK AMOUNTS */}
                            <View className="gap-2">

                                <View className="flex-row flex-wrap gap-2">
                                    {quickAmounts.map((amount) => (
                                        <TouchableOpacity
                                            key={amount}
                                            onPress={() =>
                                                setBet1(prev => ({
                                                    ...prev,
                                                    amount: String(amount),
                                                }))
                                            }
                                            className="w-[31%] rounded py-2 bg-slate-100 items-center"
                                        >
                                            <Text className="text-slate-700 font-semibold">
                                                {amount}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
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
                                onPress={() =>
                                    bet1.placed
                                        ? cashOut(1)
                                        : placeBet(1)
                                }
                                disabled={
                                    (!bet1.placed && isPlaying) ||
                                    bet1.cashedOut
                                }
                                className={`flex-1 rounded-md items-center justify-center px-2 ${
                                    bet1.placed
                                        ? 'bg-emerald-600'
                                        : isPlaying
                                            ? 'bg-slate-400'
                                            : 'bg-sky-600'
                                }`}
                            >

                                <Text className="text-white font-bold text-base">
                                    {bet1.cashedOut
                                        ? `CASHED +${bet1.profit.toFixed(0)}`
                                        : bet1.placed
                                            ? `CASHOUT +${(
                                                Number(bet1.amount) * gameState.multiplier
                                            ).toFixed(0)}`
                                            : 'PLACE A BET'}
                                </Text>

                                {!bet1.placed && isPlaying && !bet1.cashedOut && (
                                    <Text className="text-white text-[10px] opacity-80">
                                        (on the next round)
                                    </Text>
                                )}

                            </TouchableOpacity>

                        </View>

                    </View>

                    <View className="w-full flex-row gap-2 rounded-md bg-slate-200 p-2">

                        {/* LEFT SIDE */}
                        <View className="flex-1 gap-2">

                            {/* INPUT */}
                            <View className="flex-row items-center rounded-md bg-white px-3 py-1">
                                <TextInput
                                    value={bet2.amount}
                                    onChangeText={(text) =>
                                        setBet2(prev => ({
                                            ...prev,
                                            amount: text,
                                        }))
                                    }
                                    placeholder="10"
                                    keyboardType="numeric"
                                    className="flex-1 text-slate-800 font-semibold"
                                    placeholderTextColor="#64748B"
                                />

                                <TouchableOpacity
                                    onPress={() => setBet1(prev => ({
                                        ...prev,
                                        amount: ""
                                    }))}>
                                    <MaterialIcons name="close" size={18} color="#64748B"/>
                                </TouchableOpacity>
                            </View>

                            {/* QUICK AMOUNTS */}
                            <View className="gap-2">

                                <View className="flex-row flex-wrap gap-2">
                                    {quickAmounts.map((amount) => (
                                        <TouchableOpacity
                                            key={amount}
                                            onPress={() =>
                                                setBet2(prev => ({
                                                    ...prev,
                                                    amount: String(amount),
                                                }))
                                            }
                                            className="w-[31%] rounded py-2 bg-slate-100 items-center"
                                        >
                                            <Text className="text-slate-700 font-semibold">
                                                {amount}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
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

                            <TouchableOpacity
                                onPress={() =>
                                    bet2.placed
                                        ? cashOut(2)
                                        : placeBet(2)
                                }
                                disabled={
                                    (!bet2.placed && isPlaying) ||
                                    bet2.cashedOut
                                }
                                className={`flex-1 rounded-md items-center justify-center px-2 ${
                                    bet2.placed
                                        ? 'bg-emerald-600'
                                        : isPlaying
                                            ? 'bg-slate-400'
                                            : 'bg-sky-600'
                                }`}
                            >

                                <Text className="text-white font-bold text-base">
                                    {bet2.cashedOut
                                        ? `CASHED +${bet2.profit.toFixed(0)}`
                                        : bet2.placed
                                            ? `CASHOUT +${(
                                                Number(bet2.amount) * gameState.multiplier
                                            ).toFixed(0)}`
                                            : 'PLACE A BET'}
                                </Text>

                                {!bet2.placed && isPlaying && !bet2.cashedOut && (
                                    <Text className="text-white text-[10px] opacity-80">
                                        (on the next round)
                                    </Text>
                                )}

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
