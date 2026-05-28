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
                      onDisableAutoplay
                  }: Props) => {


    return (
        <View className="w-full flex-row gap-2 rounded-md bg-slate-200 p-2">

            {/* LEFT SIDE */}
            <View className="flex-1 gap-2">

                {/* INPUT */}
                <View className="flex-row items-center rounded-md bg-white px-3 py-1">
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
                        className="flex-1 text-slate-800 font-semibold"
                        placeholderTextColor="#64748B"
                    />

                    <TouchableOpacity
                        onPress={() => setBet(prev => ({
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
                                    setBet(prev => ({
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
                {autobet.enabled ?

                    <TouchableOpacity
                        onPress={onDisableAutoplay}
                        className="py-[14.5px] rounded-md border border-red-600 items-center justify-center"
                    >
                        <Text className="text-red-700 font-bold text-[11px]">
                            DISABLE AUTOPLAY
                        </Text>
                    </TouchableOpacity>
                    :
                    <TouchableOpacity
                        onPress={onOpenAutoplay}
                        className="py-[14.5px] rounded-md border border-sky-600 items-center justify-center ">
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            className="text-sky-700 font-bold text-[11px]"
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
                                ? 'bg-slate-400'
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
