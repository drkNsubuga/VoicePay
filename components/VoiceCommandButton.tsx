import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';

interface VoiceCommandButtonProps {
  onStartListening: () => void;
  onStopListening: () => void;
  isListening: boolean;
  disabled?: boolean;
}

export default function VoiceCommandButton({
  onStartListening,
  onStopListening,
  isListening,
  disabled = false,
}: VoiceCommandButtonProps) {
  const scaleValue = new Animated.Value(1);

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger haptic feedback on native platforms
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Haptics not available
      }
    }

    // Handle voice command
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={[
          styles.button,
          isListening && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {isListening ? (
          <MicOff size={32} color="#FFFFFF" />
        ) : (
          <Mic size={32} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
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
  buttonActive: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowColor: '#94A3B8',
    opacity: 0.6,
  },
});