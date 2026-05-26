import {useEffect, useRef, useState} from "react";
import {Text, TextInput, TouchableOpacity, View, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from "@/components/Header";
import {MaterialIcons} from "@expo/vector-icons";
import CustomModal from "@/components/CustomModal";
import GameStats from "@/components/GameStats";
import FlightDisplayScreen from "@/components/FlightDisplayScreen";
import SideBar from "@/components/SideBar";
import {GameState} from "@/types/game";
import {AutoBet, BetState} from "@/types/autobet";
import {getNextBetAmount, shouldStopAutobet} from "@/utils/autobet";
import {socket} from '@/services/socket';

type BetNumber = 1 | 2;

const createInitialAutobet = (): AutoBet => ({
    enabled: false,

    baseBet: 0,
    currentBet: 0,

    maxStake: 0,
    autoCashout: 0,

    onWinAction: 'back_to_base',
    onLoseAction: 'back_to_base',

    waitingNextRound: false,
});


const Index = () => {

    const [showAutoplayModal, setShowAutoplayModal] = useState(false);
    const [autoplayTarget, setAutoplayTarget] = useState<BetNumber>(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [balance, setBalance] = useState(5000);
    const [bet1, setBet1] = useState<BetState>({
        amount: '',
        placed: false,
        cashedOut: false,
        profit: 0,
    });

    const [bet2, setBet2] = useState<BetState>({
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

    // Each bet panel owns its own autoplay settings and next-stake progression.
    const [autobet1, setAutobet1] = useState<AutoBet>(createInitialAutobet);
    const [autobet2, setAutobet2] = useState<AutoBet>(createInitialAutobet);


    const [crashHistory, setCrashHistory] = useState<number[]>([]);

    // Prevents the same bet from paying out twice while React state updates are still pending.
    const cashoutInProgressRef = useRef<Record<1 | 2, boolean>>({
        1: false,
        2: false,
    });

    useEffect(() => {

        socket.on('update', (data) => {

            const multiplier = parseFloat(data.multiplier);

            setGameState(prev => ({
                ...prev,
                multiplier,
                status: 'playing',
            }));


            if (
                autobet1.enabled &&
                bet1.placed &&
                !bet1.cashedOut &&
                autobet1.autoCashout > 0 &&
                multiplier >= autobet1.autoCashout
            ) {

                // Bet 1 autobet must settle at the selected target, not the previous React state multiplier.
                cashOut(1, autobet1.autoCashout);
            }

            if (
                autobet2.enabled &&
                bet2.placed &&
                !bet2.cashedOut &&
                autobet2.autoCashout > 0 &&
                multiplier >= autobet2.autoCashout
            ) {

                // Bet 2 uses the same exact-multiplier cashout flow as bet 1.
                cashOut(2, autobet2.autoCashout);
            }

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

            if (autobet1.enabled && bet1.placed && !bet1.cashedOut) {

                const nextBet = getNextBetAmount(autobet1, false);

                const stop = shouldStopAutobet(
                    nextBet,
                    balance,
                    autobet1.maxStake
                );

                if (stop) {

                    setAutobet1(prev => ({
                        ...prev,
                        enabled: false,
                    }));

                } else {

                    setAutobet1(prev => ({
                        ...prev,
                        currentBet: nextBet,
                    }));
                }
            }

            if (autobet2.enabled && bet2.placed && !bet2.cashedOut) {

                const nextBet = getNextBetAmount(autobet2, false);

                const stop = shouldStopAutobet(
                    nextBet,
                    balance,
                    autobet2.maxStake
                );

                if (stop) {

                    setAutobet2(prev => ({
                        ...prev,
                        enabled: false,
                    }));

                } else {

                    setAutobet2(prev => ({
                        ...prev,
                        currentBet: nextBet,
                    }));
                }
            }

            // Reset bet placed status
            setBet1(prev => ({
                ...prev,
                placed: false,
                cashedOut: false,
            }));

            setBet2(prev => ({
                ...prev,
                placed: false,
                cashedOut: false,
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

            let availableBalance = balance;

            if (autobet1.enabled && !bet1.placed && gameState.status !== 'playing') {

                const amount = autobet1.currentBet;

                if (availableBalance >= amount) {
                    availableBalance -= amount;

                    // Each automatic next-round bet must be able to cash out once.
                    cashoutInProgressRef.current[1] = false;

                    setBalance(prev => prev - amount);

                    setBet1(prev => ({
                        ...prev,
                        amount: String(amount),
                        placed: true,
                        cashedOut: false,
                        profit: 0,
                    }));

                } else {

                    setAutobet1(prev => ({
                        ...prev,
                        enabled: false,
                    }));
                }
            }

            if (autobet2.enabled && !bet2.placed && gameState.status !== 'playing') {

                const amount = autobet2.currentBet;

                if (availableBalance >= amount) {
                    availableBalance -= amount;

                    // Bet 2 gets the same one-cashout reset before automatic placement.
                    cashoutInProgressRef.current[2] = false;

                    setBalance(prev => prev - amount);

                    setBet2(prev => ({
                        ...prev,
                        amount: String(amount),
                        placed: true,
                        cashedOut: false,
                        profit: 0,
                    }));

                } else {

                    setAutobet2(prev => ({
                        ...prev,
                        enabled: false,
                    }));
                }
            }

            // Reset cashout status for next round
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

    }, [ autobet1, autobet2, bet1, bet2, balance, gameState.multiplier]);

    const placeBet = (betNumber: BetNumber) => {

        const currentBet = betNumber === 1 ? bet1 : bet2;

        const amount = Number(currentBet.amount);

        if (!amount || amount <= 0) return;

        if (amount > balance) return;

        // A new placed bet is allowed to cash out once.
        cashoutInProgressRef.current[betNumber] = false;

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

    const cashOut = (betNumber: BetNumber, cashoutMultiplier = gameState.multiplier) => {
        const currentBet = betNumber === 1 ? bet1 : bet2;
        const currentAutobet = betNumber === 1 ? autobet1 : autobet2;
        const setCurrentAutobet = betNumber === 1 ? setAutobet1 : setAutobet2;

        if (!currentBet.placed || currentBet.cashedOut) return;

        if (cashoutInProgressRef.current[betNumber]) return;

        // Set this before balance updates so repeated socket ticks cannot pay the same bet twice.
        cashoutInProgressRef.current[betNumber] = true;

        const amount = Number(currentBet.amount);
        const settledMultiplier = Number(cashoutMultiplier.toFixed(2));

        // This value is the full payout returned to balance: stake + winnings.
        const profit = Number((amount * settledMultiplier).toFixed(2));

        setGameState(prev => ({
            ...prev,
            cashoutMultiplier: settledMultiplier,
        }));

        // Send the exact client-settled multiplier and bet slot so both panels can cash out in one round.
        socket.emit('cashOut', {
            betNumber,
            multiplier: settledMultiplier.toFixed(2),
        });

        setBalance(prev => prev + profit);

        if (betNumber === 1) {
            setBet1(prev => ({
                ...prev,
                placed: false,  // Bet is settled
                cashedOut: true,
                profit,
            }));

            if (currentAutobet.enabled) {

                const nextBet = getNextBetAmount(currentAutobet, true);

                const stop = shouldStopAutobet(nextBet, balance + profit, currentAutobet.maxStake);

                if (stop) {

                    setCurrentAutobet(prev => ({
                        ...prev,
                        enabled: false,
                    }));

                } else {

                    setCurrentAutobet(prev => ({
                        ...prev,
                        currentBet: nextBet,
                    }));
                }
            }
        } else {
            setBet2(prev => ({
                ...prev,
                placed: false,
                cashedOut: true,
                profit,
            }));

            if (currentAutobet.enabled) {

                const nextBet = getNextBetAmount(currentAutobet, true);

                const stop = shouldStopAutobet(nextBet, balance + profit, currentAutobet.maxStake);

                if (stop) {

                    setCurrentAutobet(prev => ({
                        ...prev,
                        enabled: false,
                    }));

                } else {

                    setCurrentAutobet(prev => ({
                        ...prev,
                        currentBet: nextBet,
                    }));
                }
            }
        }
    };

    const handlePlaceAutobet = (betData: any) => {

        const baseBet = Number(betData.baseBet);
        const maxStake = Number(betData.maxStake);
        const autoCashout = Number(betData.autoCashout);
        const selectedBetNumber = autoplayTarget;
        const setSelectedAutobet = selectedBetNumber === 1 ? setAutobet1 : setAutobet2;
        const setSelectedBet = selectedBetNumber === 1 ? setBet1 : setBet2;

        if (
            baseBet <= 0 ||
            maxStake <= 0 ||
            autoCashout < 1.01
        ) {
            return;
        }

        if (gameState.status === 'waiting' && balance < baseBet) {
            return;
        }

        setSelectedAutobet({
            enabled: true,

            baseBet,
            currentBet: baseBet,
            maxStake,
            autoCashout,

            onWinAction: betData.onWinAction,
            onLoseAction: betData.onLoseAction,

            waitingNextRound: gameState.status === 'playing',
        });

        if (gameState.status === 'waiting') {

            // Immediate autobet placement starts a fresh one-cashout cycle for the selected panel.
            cashoutInProgressRef.current[selectedBetNumber] = false;

            setBalance(prev => prev - baseBet);

            setSelectedBet(prev => ({
                ...prev,
                amount: String(baseBet),
                placed: true,
                cashedOut: false,
                profit: 0,
            }));
        }
    };

    const disableAutobet = (betNumber: BetNumber) => {
        const setSelectedAutobet = betNumber === 1 ? setAutobet1 : setAutobet2;

        setSelectedAutobet(prev => ({
            ...prev,
            enabled: false,
        }));
    };

    const openAutoplayModal = (betNumber: BetNumber) => {
        // Remember which bet panel opened the shared modal.
        setAutoplayTarget(betNumber);
        setShowAutoplayModal(true);
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
                            {autobet1.enabled ?

                                <TouchableOpacity
                                    onPress={() => disableAutobet(1)}
                                    className="py-[14.5px] rounded-md border border-red-600 items-center justify-center mt-[1.5px]"
                                >
                                    <Text className="text-red-700 font-bold text-[11px]">
                                        DISABLE AUTOPLAY
                                    </Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    onPress={() => openAutoplayModal(1)}
                                    className="py-[14.5px] rounded-md border border-sky-600 items-center justify-center mt-[1.5px]">
                                    <Text
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="text-sky-700 font-bold text-[11px]"
                                    >
                                        ENABLE AUTOPLAY
                                    </Text>
                                </TouchableOpacity>
                            }


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
                            {autobet2.enabled ?

                                <TouchableOpacity
                                    onPress={() => disableAutobet(2)}
                                    className="py-[14.5px] rounded-md border border-red-600 items-center justify-center mt-[1.5px]"
                                >
                                    <Text className="text-red-700 font-bold text-[11px]">
                                        DISABLE AUTOPLAY
                                    </Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    onPress={() => openAutoplayModal(2)}
                                    className="py-[14.5px] rounded-md border border-sky-600 items-center justify-center mt-[1.5px]">
                                    <Text
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                        className="text-sky-700 font-bold text-[11px]"
                                    >
                                        ENABLE AUTOPLAY
                                    </Text>
                                </TouchableOpacity>
                            }

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
                setAutobet={autoplayTarget === 1 ? setAutobet1 : setAutobet2}
                autobet={autoplayTarget === 1 ? autobet1 : autobet2}
                onPlaceBet={handlePlaceAutobet}
            />

        </SafeAreaView>
    );
};

export default Index;
