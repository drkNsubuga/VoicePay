import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Send } from 'lucide-react-native';
import { VoiceService } from '@/services/VoiceService';
import { TransactionService } from '@/services/TransactionService';
import { CommandProcessor } from '@/services/CommandProcessor';

export default function HomeScreen() {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState(250000);
  const micScale = new Animated.Value(1);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    const userBalance = await TransactionService.getBalance();
    setBalance(userBalance);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      setRecognizedText('');
      
      // Animate microphone
      Animated.sequence([
        Animated.timing(micScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(micScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      if (Platform.OS !== 'web') {
        await VoiceService.startListening((text) => {
          setRecognizedText(text);
        });
      } else {
        // Web fallback - simulate voice recognition
        setTimeout(() => {
          const sampleCommands = [
            'Send 50000 to John',
            'Check my balance',
            'Send 25000 to Mary',
            'Transfer 100000 to David'
          ];
          const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
          setRecognizedText(randomCommand);
          setIsListening(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Voice recognition error:', error);
      setIsListening(false);
      Alert.alert('Error', 'Could not start voice recognition');
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    if (Platform.OS !== 'web') {
      await VoiceService.stopListening();
    }
  };

  const processCommand = async () => {
    if (!recognizedText.trim()) return;

    setIsProcessing(true);
    try {
      const result = await CommandProcessor.processCommand(recognizedText);
      
      if (result.success) {
        if (result.type === 'balance') {
          Alert.alert('Balance Inquiry', `Your current balance is UGX ${result.balance?.toLocaleString()}`);
        } else if (result.type === 'transfer') {
          Alert.alert(
            'Confirm Transaction',
            `Send UGX ${result.amount?.toLocaleString()} to ${result.recipient}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Confirm',
                onPress: async () => {
                  const transactionResult = await TransactionService.processTransaction({
                    type: 'transfer',
                    amount: result.amount!,
                    recipient: result.recipient!,
                    description: recognizedText,
                  });
                  
                  if (transactionResult.success) {
                    Alert.alert('Success', 'Transaction completed successfully!');
                    loadBalance();
                    setRecognizedText('');
                  } else {
                    Alert.alert('Error', transactionResult.error || 'Transaction failed');
                  }
                },
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', result.error || 'Could not understand command');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
      >
        <Text style={styles.appName}>VoicePay</Text>
        <Text style={styles.tagline}>Send money. Speak freely.</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>UGX {balance.toLocaleString()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.voiceSection}>
          <Text style={styles.sectionTitle}>Voice Command</Text>
          
          <Animated.View style={[styles.microphoneContainer, { transform: [{ scale: micScale }] }]}>
            <TouchableOpacity
              style={[styles.microphoneButton, isListening && styles.microphoneButtonActive]}
              onPress={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening ? (
                <MicOff size={32} color="#FFFFFF" />
              ) : (
                <Mic size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.microphoneLabel}>
            {isListening ? 'Listening...' : 'Tap to speak'}
          </Text>

          {recognizedText ? (
            <View style={styles.commandContainer}>
              <Text style={styles.commandLabel}>Recognized Command:</Text>
              <Text style={styles.commandText}>{recognizedText}</Text>
              
              <TouchableOpacity
                style={styles.processButton}
                onPress={processCommand}
                disabled={isProcessing}
              >
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.processButtonText}>
                  {isProcessing ? 'Processing...' : 'Process Command'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Voice Commands</Text>
          <Text style={styles.helpText}>• "Send [amount] to [name]"</Text>
          <Text style={styles.helpText}>• "Check my balance"</Text>
          <Text style={styles.helpText}>• "Transfer [amount] to [name]"</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#BFDBFE',
    textAlign: 'center',
    marginBottom: 24,
  },
  balanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#BFDBFE',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 32,
  },
  microphoneContainer: {
    marginBottom: 16,
  },
  microphoneButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  microphoneButtonActive: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  microphoneLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 32,
  },
  commandContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  commandLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 8,
  },
  commandText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  processButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  processButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  helpSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  helpTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
});