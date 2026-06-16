import {Text, TextInput, TouchableOpacity, View} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import {AutoBet, BetState} from "@/types/autobet";

type Props = {
    betNumber: 1 | 2;

    bet: BetState;
    setBet: React.Dispatch<React.SetStateAction<BetState>>;

    autobet: AutoBet;

    quickAmounts: number[];

    isPlaying: boolean;

    gameMultiplier: number;

    onPlaceBet: () => void;
    onCashOut: () => void;

    onOpenAutoplay: () => void;
    onDisableAutoplay: () => void;

    isDarkMode: boolean;
};

const BetPanel = ({
                      bet,
                      setBet,
                      autobet,
                      quickAmounts,
                      isPlaying,
                      gameMultiplier,
                      onPlaceBet,
                      onCashOut,
                      onOpenAutoplay,
                      onDisableAutoplay,
                      isDarkMode
                  }: Props) => {


    return (
        <View
            className={`w-full flex-row gap-2 rounded-md p-2 ${
                isDarkMode
                    ? 'bg-[#252c50]'
                    : 'bg-slate-200'
            }`}
        >

            {/* LEFT SIDE */}
            <View className="flex-1 gap-2">

                {/* INPUT */}
                <View className={`flex-row items-center rounded-md px-3 py-1 ${isDarkMode ? 'bg-[#111833]' : 'bg-white'}`}>
                    <TextInput
                        value={bet.amount}
                        onChangeText={(text) =>
                            setBet(prev => ({
                                ...prev,
                                amount: text,
                            }))
                        }
                        placeholder="10"
                        keyboardType="numeric"
                        className={`flex-1 font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
                        placeholderTextColor={isDarkMode ? '#94A3B8' : '#64748B'}
                    />

                    <TouchableOpacity
                        onPress={() => setBet(prev => ({
                            ...prev,
                            amount: ""
                        }))}>
                        <MaterialIcons name="close" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'}/>
                    </TouchableOpacity>
                </View>

                {/* QUICK AMOUNTS */}
                <View className="gap-2">

                    <View className="flex-row flex-wrap gap-2">
                        {quickAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                onPress={() =>
                                    setBet(prev => ({
                                        ...prev,
                                        amount: String(amount),
                                    }))
                                }
                                className={`w-[31%] rounded py-2 items-center ${
                                    isDarkMode ? 'bg-[#30385f]' : 'bg-slate-100'
                                }`}
                            >
                                <Text className={`${isDarkMode ? 'text-slate-200' : 'text-slate-700'} font-semibold`}>
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
                {autobet.enabled ?

                    <TouchableOpacity
                        onPress={onDisableAutoplay}
                        className={`py-[14.5px] rounded-md border items-center justify-center ${
                            isDarkMode ? 'border-red-400' : 'border-red-600'
                        }`}
                    >
                        <Text className={`${isDarkMode ? 'text-red-300' : 'text-red-700'} font-bold text-[11px]`}>
                            DISABLE AUTOPLAY
                        </Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        onPress={onOpenAutoplay}
                        className={`py-[14.5px] rounded-md border items-center justify-center ${
                            isDarkMode ? 'border-sky-400' : 'border-sky-600'
                        }`}>
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            className={`${isDarkMode ? 'text-sky-300' : 'text-sky-700'} font-bold text-[11px]`}
                        >
                            ENABLE AUTOPLAY
                        </Text>
                    </TouchableOpacity>
                }


                {/* PLACE BET */}
                <TouchableOpacity
                    onPress={() =>
                        bet.placed
                            ? onCashOut()
                            : onPlaceBet()
                    }
                    disabled={
                        (!bet.placed && isPlaying) ||
                        bet.cashedOut
                    }
                    className={`flex-1 rounded-md items-center justify-center px-2 ${
                        bet.placed
                            ? 'bg-emerald-600'
                            : isPlaying
                                ? isDarkMode ? 'bg-[#47516f]' : 'bg-slate-400'
                                : 'bg-sky-600'
                    }`}
                >

                    <Text className="text-white font-bold text-base">
                        {bet.cashedOut
                            ? `CASHED +${bet.profit.toFixed(0)}`
                            : bet.placed
                                ? `CASHOUT +${(
                                    Number(bet.amount) * gameMultiplier
                                ).toFixed(0)}`
                                : 'PLACE A BET'}
                    </Text>

                    {!bet.placed && isPlaying && !bet.cashedOut && (
                        <Text className="text-white text-[10px] opacity-80">
                            (on the next round)
                        </Text>
                    )}

                </TouchableOpacity>

            </View>

        </View>
    )
}
export default BetPanel
