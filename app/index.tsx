import {useEffect, useState} from "react";
import {View, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from "@/components/Header";
import CustomModal from "@/components/CustomModal";
import GameStats from "@/components/GameStats";
import FlightDisplayScreen from "@/components/FlightDisplayScreen";
import SideBar from "@/components/SideBar";
import {socket} from '@/services/socket';
import BetPanel from "@/components/BetPanel";
import {useCrashGame} from "@/hooks/useCrashGame";
import {useBetManager} from "@/hooks/useBetManager";
import {useAutobet} from "@/hooks/useAutobet";

type BetNumber = 1 | 2;


const Index = () => {

    const [showAutoplayModal, setShowAutoplayModal] = useState(false);
    const [autoplayTarget, setAutoplayTarget] = useState<BetNumber>(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const quickAmounts = [10, 50, 100, 200, 500, 1000];

    const startingBalance = 5000;

    const {gameState, setGameState, crashHistory,} = useCrashGame();
    const {
        balance,
        setBalance,
        bet1,
        setBet1,
        bet2,
        setBet2,
        cashoutInProgressRef,


        placeBet,
        cashOut,
        registerLoss,
        stats,
        registerBet
    } = useBetManager();

    const handleCashOut = (betNumber: BetNumber, multiplier = gameState.multiplier) => {

        const result =
            cashOut(betNumber, multiplier);

        if (!result) return;

        setGameState(prev => ({
            ...prev,
            cashoutMultiplier:
            result.settledMultiplier,
        }));

        socket.emit('cashOut', {
            betNumber,
            multiplier:
                result.settledMultiplier.toFixed(2),
        });
    };


    const {autobet1, setAutobet1, autobet2, setAutobet2, handlePlaceAutobet, disableAutobet,} = useAutobet({
        gameState,
        balance,
        bet1,
        bet2,
        setBet1,
        setBet2,
        setBalance,
        cashoutInProgressRef,
        onCashOut: handleCashOut,
        registerLoss,
        registerBet
    });


    useEffect(() => {

        socket.on('cashedOut', (data) => {
            console.log('Player cashed out at:', data.multiplier);
        });

        return () => {
            socket.off('cashedOut');
        };

    }, [bet1, bet2, balance, gameState.multiplier]);


    const openAutoplayModal = (betNumber: BetNumber) => {
        setAutoplayTarget(betNumber);
        setShowAutoplayModal(true);
    };

    const winRate = stats.totalBets > 0 ? Math.round((stats.totalWins / stats.totalBets) * 100) : 0;

    const profitGrowth = (stats.totalProfit / startingBalance) * 100;


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
                    <BetPanel
                        betNumber={1}
                        bet={bet1}
                        setBet={setBet1}
                        autobet={autobet1}
                        quickAmounts={quickAmounts}
                        isPlaying={isPlaying}
                        gameMultiplier={gameState.multiplier}
                        onPlaceBet={() => placeBet(1)}
                        onCashOut={() => handleCashOut(1)}
                        onOpenAutoplay={() => openAutoplayModal(1)}
                        onDisableAutoplay={() => disableAutobet(1)}
                    />

                    <BetPanel
                        betNumber={2}
                        bet={bet2}
                        setBet={setBet2}
                        autobet={autobet2}
                        quickAmounts={quickAmounts}
                        isPlaying={isPlaying}
                        gameMultiplier={gameState.multiplier}
                        onPlaceBet={() => placeBet(2)}
                        onCashOut={() => handleCashOut(2)}
                        onOpenAutoplay={() => openAutoplayModal(2)}
                        onDisableAutoplay={() => disableAutobet(2)}
                    />
                </View>

                {/* Log of Total Bets, Wins & Losses */}
                <GameStats
                    totalBets={stats.totalBets}
                    totalWins={stats.totalWins}
                    totalLosses={stats.totalLosses}
                    totalProfit={stats.totalProfit}
                    winRate={winRate}
                    profitGrowth={profitGrowth}
                />

            </ScrollView>

            <CustomModal
                visible={showAutoplayModal}
                onClose={() => setShowAutoplayModal(false)}
                setAutobet={autoplayTarget === 1 ? setAutobet1 : setAutobet2}
                autobet={autoplayTarget === 1 ? autobet1 : autobet2}
                onPlaceBet={(betData) => handlePlaceAutobet(betData, autoplayTarget)
                }
            />

        </SafeAreaView>
    );
};

export default Index;
