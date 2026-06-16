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
import { MaterialIcons } from '@expo/vector-icons';

interface CustomModalProps {
    visible: boolean;
    onClose: () => void;
    onPlaceBet: (betData: BetData) => void;
    isDarkMode: boolean;

    setAutobet?: (autobet: any) => void;
    autobet?: any;
}

interface BetData {
    baseBet: string;
    maxStake: string;
    autoCashout: string;
    onWinAction: 'back_to_base' | 'double_stake';
    onLoseAction: 'back_to_base' | 'double_stake';
}

const CustomModal: React.FC<CustomModalProps> = ({visible, onClose, onPlaceBet, isDarkMode}) => {
    // State management
    const [baseBet, setBaseBet] = useState('');
    const [maxStake, setMaxStake] = useState('');
    const [autoCashout, setAutoCashout] = useState('');
    const [onWinAction, setOnWinAction] = useState<'back_to_base' | 'double_stake'>('back_to_base');
    const [onLoseAction, setOnLoseAction] = useState<'back_to_base' | 'double_stake'>('back_to_base');

    const modalBackdropClass = isDarkMode ? 'bg-black/70' : 'bg-black/60';
    const modalCardClass = isDarkMode ? 'bg-[#252c50] border border-[#3d466f]' : 'bg-white';
    const titleClass = isDarkMode ? 'text-sky-300' : 'text-sky-700';
    const labelClass = isDarkMode ? 'text-slate-200' : 'text-slate-700';
    const inputContainerClass = isDarkMode ? 'bg-[#111833]' : 'bg-slate-100';
    const inputTextClass = isDarkMode ? 'text-slate-100' : 'text-slate-800';
    const optionTextClass = isDarkMode ? 'text-slate-300' : 'text-slate-600';
    const unselectedRadioClass = isDarkMode ? 'border-slate-500' : 'border-slate-400';
    const placeholderColor = isDarkMode ? '#94A3B8' : '#64748B';

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
                <View className={`flex-1 ${modalBackdropClass} items-center justify-center px-4`}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            className="w-full"
                        >
                            <View className={`w-full rounded-xl p-4 ${modalCardClass}`}>

                                {/* TITLE WITH CLOSE BUTTON */}
                                <View className="flex-row relative justify-between items-center mb-4">
                                    <Text className={`${titleClass} text-center text-lg font-bold flex-1`}>
                                        AUTOPLAY
                                    </Text>

                                    <TouchableOpacity onPress={handleClose} className="p-1 absolute -right-3 -top-12">
                                        <MaterialIcons name="close" size={22} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>

                                {/* BASE BET */}
                                <View className="mb-4 ">
                                    <Text className={`${labelClass} text-sm mb-1.5 font-semibold  tracking-wide`}>
                                        Base bet
                                    </Text>

                                    <View className={`flex-row items-center rounded-md ${inputContainerClass} px-3`}>
                                        <TextInput
                                            placeholder="10"
                                            placeholderTextColor={placeholderColor}
                                            keyboardType="numeric"
                                            value={baseBet}
                                            onChangeText={setBaseBet}
                                            className={`flex-1 ${inputTextClass} text-base`}
                                        />

                                        {baseBet.length > 0 && (
                                            <TouchableOpacity onPress={() => setBaseBet('')}>
                                                <MaterialIcons name="close" size={18} color={placeholderColor} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* MAX STAKE */}
                                <View className="mb-4">
                                    <Text className={`${labelClass} text-sm mb-1.5 font-semibold tracking-wide`}>
                                        Max. stake amount
                                    </Text>

                                    <View className={`flex-row items-center rounded-md ${inputContainerClass} px-3`}>
                                        <TextInput
                                            placeholder="Enter amount"
                                            placeholderTextColor={placeholderColor}
                                            keyboardType="numeric"
                                            value={maxStake}
                                            onChangeText={setMaxStake}
                                            className={`flex-1 ${inputTextClass} text-base`}
                                        />

                                        {maxStake.length > 0 && (
                                            <TouchableOpacity onPress={() => setMaxStake('')}>
                                                <MaterialIcons name="close" size={18} color={placeholderColor} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* AUTO CASHOUT */}
                                <View className="mb-5">
                                    <Text className={`${labelClass} text-sm mb-1.5 font-semibold tracking-wide`}>
                                        Auto cashout (≥ 1.01)
                                    </Text>

                                    <View className={`flex-row items-center rounded-md ${inputContainerClass} px-3 `}>
                                        <TextInput
                                            placeholder="Enter odds"
                                            placeholderTextColor={placeholderColor}
                                            keyboardType="numeric"
                                            value={autoCashout}
                                            onChangeText={setAutoCashout}
                                            className={`flex-1 ${inputTextClass} text-base`}
                                        />

                                        {autoCashout.length > 0 && (
                                            <TouchableOpacity onPress={() => setAutoCashout('')}>
                                                <MaterialIcons name="close" size={18} color={placeholderColor} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* OPTIONS */}
                                <View className="flex-row justify-between mb-6 gap-3">

                                    {/* IF YOU WIN */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-1 mb-3">
                                            <Text className={`${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'} font-bold text-sm tracking-wide`}>
                                                IF YOU WIN
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            className="flex-row items-center mb-3"
                                            onPress={() => setOnWinAction('back_to_base')}
                                        >
                                            <View className="w-4 h-4 rounded-full border-2 border-emerald-600 items-center justify-center mr-2.5">
                                                {onWinAction === 'back_to_base' && (
                                                    <View className="w-2 h-2 rounded-full bg-emerald-600" />
                                                )}
                                            </View>

                                            <Text className={`${optionTextClass} font-semibold text-sm`}>
                                                Back to base stake
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="flex-row items-center"
                                            onPress={() => setOnWinAction('double_stake')}
                                        >
                                            <View className={`w-4 h-4 rounded-full border-2 ${unselectedRadioClass} items-center justify-center mr-2.5`}>
                                                {onWinAction === 'double_stake' && (
                                                    <View className="w-2 h-2 rounded-full bg-emerald-600" />
                                                )}
                                            </View>

                                            <Text className={`${optionTextClass} font-semibold text-sm`}>
                                                Double your stake
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* IF YOU LOSE */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-1 mb-3">
                                            <Text className={`${isDarkMode ? 'text-rose-300' : 'text-rose-700'} font-bold text-sm tracking-wide`}>
                                                IF YOU LOSE
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            className="flex-row items-center mb-3"
                                            onPress={() => setOnLoseAction('back_to_base')}
                                        >
                                            <View className="w-4 h-4 rounded-full border-2 border-rose-600 items-center justify-center mr-2.5">
                                                {onLoseAction === 'back_to_base' && (
                                                    <View className="w-2 h-2 rounded-full bg-rose-600" />
                                                )}
                                            </View>

                                            <Text className={`${optionTextClass} font-semibold text-sm`}>
                                                Back to base stake
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="flex-row items-center"
                                            onPress={() => setOnLoseAction('double_stake')}
                                        >
                                            <View className={`w-4 h-4 rounded-full border-2 ${unselectedRadioClass} items-center justify-center mr-2.5`}>
                                                {onLoseAction === 'double_stake' && (
                                                    <View className="w-2 h-2 rounded-full bg-rose-600" />
                                                )}
                                            </View>

                                            <Text className={`${optionTextClass} font-semibold text-sm`}>
                                                Double your stake
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>

                                {/* BUTTONS */}
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        className="flex-1 bg-sky-600 rounded-lg py-3 items-center"
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
