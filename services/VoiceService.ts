import { Platform } from 'react-native';

interface VoiceService {
  startListening: (onResult: (text: string) => void) => Promise<void>;
  stopListening: () => Promise<void>;
  isAvailable: () => boolean;
}

class NativeVoiceService implements VoiceService {
  private onResultCallback?: (text: string) => void;

  async startListening(onResult: (text: string) => void): Promise<void> {
    if (Platform.OS === 'web') {
      throw new Error('Native voice service not available on web');
    }

    try {
      // For native platforms, we'll import the voice library dynamically
      const Voice = require('@react-native-voice/voice').default;
      
      this.onResultCallback = onResult;
      
      Voice.onSpeechResults = (event: any) => {
        if (event.value && event.value.length > 0) {
          this.onResultCallback?.(event.value[0]);
        }
      };

      Voice.onSpeechError = (event: any) => {
        console.error('Voice recognition error:', event.error);
      };

      await Voice.start('en-US');
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      throw error;
    }
  }

  async stopListening(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const Voice = require('@react-native-voice/voice').default;
      await Voice.stop();
      await Voice.destroy();
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  }

  isAvailable(): boolean {
    return Platform.OS !== 'web';
  }
}

class WebVoiceService implements VoiceService {
  private recognition: any = null;
  private onResultCallback?: (text: string) => void;

  async startListening(onResult: (text: string) => void): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Web Speech API not available');
    }

    this.onResultCallback = onResult;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.onResultCallback?.(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.start();
  }

  async stopListening(): Promise<void> {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }
}

// Create the appropriate service based on platform
const createVoiceService = (): VoiceService => {
  if (Platform.OS === 'web') {
    return new WebVoiceService();
  }
  return new NativeVoiceService();
};

export const VoiceService = createVoiceService();