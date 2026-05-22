import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // or your icon library

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    onPlaceBet: (betData: BetData) => void;
}

interface BetData {
    baseBet: string;
    maxStake: string;
    autoCashout: string;
    onWinAction: 'back_to_base' | 'double_stake';
    onLoseAction: 'back_to_base' | 'double_stake';
}

const CustomModal: React.FC<CustomModalProps> = ({visible, onClose, onPlaceBet}) => {
    // State management
    const [baseBet, setBaseBet] = useState('');
    const [maxStake, setMaxStake] = useState('');
    const [autoCashout, setAutoCashout] = useState('');
    const [onWinAction, setOnWinAction] = useState<'back_to_base' | 'double_stake'>('back_to_base');
    const [onLoseAction, setOnLoseAction] = useState<'back_to_base' | 'double_stake'>('back_to_base');

    // Reset form when modal closes
    const resetForm = () => {
        setBaseBet('');
        setMaxStake('');
        setAutoCashout('');
        setOnWinAction('back_to_base');
        setOnLoseAction('back_to_base');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handlePlaceBet = () => {
        onPlaceBet({
            baseBet,
            maxStake,
            autoCashout,
            onWinAction,
            onLoseAction,
        });
        handleClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View className="flex-1 bg-black/60 items-center justify-center px-4">
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            className="w-full"
                        >
                            <View className="w-full rounded-xl bg-white p-4">

                                {/* TITLE WITH CLOSE BUTTON */}
                                <View className="flex-row relative justify-between items-center mb-4">
                                    <Text className="text-blue-500 text-center text-lg font-bold flex-1">
                                        AUTOPLAY
                                    </Text>

                                    <TouchableOpacity onPress={handleClose} className="p-1 absolute -right-3 -top-12">
                                        <MaterialIcons name="close" size={22} color="#ffff" />
                                    </TouchableOpacity>
                                </View>

                                {/* BASE BET */}
                                <View className="mb-4 ">
                                    <Text className="text-gray-600 text-sm mb-1.5 font-semibold  tracking-wide">
                                        Base bet
                                    </Text>

                                    <View className="flex-row items-center rounded-md bg-neutral-300 px-3">
                                        <TextInput
                                            placeholder="10"
                                            placeholderTextColor="#6B7280"
                                            keyboardType="numeric"
                                            value={baseBet}
                                            onChangeText={setBaseBet}
                                            className="flex-1 text-gray-600 text-base"
                                        />

                                        {baseBet.length > 0 && (
                                            <TouchableOpacity onPress={() => setBaseBet('')}>
                                                <MaterialIcons name="close" size={18} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* MAX STAKE */}
                                <View className="mb-4">
                                    <Text className="text-gray-600 text-sm mb-1.5 font-semibold tracking-wide">
                                        Max. stake amount
                                    </Text>

                                    <View className="flex-row items-center rounded-md bg-neutral-300 px-3">
                                        <TextInput
                                            placeholder="Enter amount"
                                            placeholderTextColor="#6B7280"
                                            keyboardType="numeric"
                                            value={maxStake}
                                            onChangeText={setMaxStake}
                                            className="flex-1 text-gray-600 text-base"
                                        />

                                        {maxStake.length > 0 && (
                                            <TouchableOpacity onPress={() => setMaxStake('')}>
                                                <MaterialIcons name="close" size={18} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* AUTO CASHOUT */}
                                <View className="mb-5">
                                    <Text className="text-gray-600 text-sm mb-1.5 font-semibold tracking-wide">
                                        Auto cashout (≥ 1.01)
                                    </Text>

                                    <View className="flex-row items-center rounded-md bg-neutral-300 px-3 ">
                                        <TextInput
                                            placeholder="Enter odds"
                                            placeholderTextColor="#6B7280"
                                            keyboardType="numeric"
                                            value={autoCashout}
                                            onChangeText={setAutoCashout}
                                            className="flex-1 text-gray-600 text-base"
                                        />

                                        {autoCashout.length > 0 && (
                                            <TouchableOpacity onPress={() => setAutoCashout('')}>
                                                <MaterialIcons name="close" size={18} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* OPTIONS */}
                                <View className="flex-row justify-between mb-6 gap-3">

                                    {/* IF YOU WIN */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-1 mb-3">
                                            <Text className="text-lime-400 font-bold text-sm tracking-wide">
                                                IF YOU WIN
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            className="flex-row items-center mb-3"
                                            onPress={() => setOnWinAction('back_to_base')}
                                        >
                                            <View className="w-4 h-4 rounded-full border-2 border-lime-400 items-center justify-center mr-2.5">
                                                {onWinAction === 'back_to_base' && (
                                                    <View className="w-2 h-2 rounded-full bg-lime-400" />
                                                )}
                                            </View>

                                            <Text className="text-gray-500 font-semibold text-sm">
                                                Back to base stake
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="flex-row items-center"
                                            onPress={() => setOnWinAction('double_stake')}
                                        >
                                            <View className="w-4 h-4 rounded-full border-2 border-gray-500 items-center justify-center mr-2.5">
                                                {onWinAction === 'double_stake' && (
                                                    <View className="w-2 h-2 rounded-full bg-lime-400" />
                                                )}
                                            </View>

                                            <Text className="text-gray-500 font-semibold text-sm">
                                                Double your stake
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* IF YOU LOSE */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-1 mb-3">
                                            <Text className="text-red-500 font-bold text-sm tracking-wide">
                                                IF YOU LOSE
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            className="flex-row items-center mb-3"
                                            onPress={() => setOnLoseAction('back_to_base')}
                                        >
                                            <View className="w-4 h-4 rounded-full border-2 border-red-500 items-center justify-center mr-2.5">
                                                {onLoseAction === 'back_to_base' && (
                                                    <View className="w-2 h-2 rounded-full bg-red-500" />
                                                )}
                                            </View>

                                            <Text className="text-gray-500 font-semibold text-sm">
                                                Back to base stake
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="flex-row items-center"
                                            onPress={() => setOnLoseAction('double_stake')}
                                        >
                                            <View className="w-4 h-4 rounded-full border-2 border-gray-500 items-center justify-center mr-2.5">
                                                {onLoseAction === 'double_stake' && (
                                                    <View className="w-2 h-2 rounded-full bg-red-500" />
                                                )}
                                            </View>

                                            <Text className="text-gray-500 font-semibold text-sm">
                                                Double your stake
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>

                                {/* BUTTONS */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
                                        onPress={handlePlaceBet}
                                    >
                                        <Text className="text-white font-bold tracking-wide">
                                            PLACE AUTOBET
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default CustomModal;
