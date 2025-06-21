# VoicePay: Your Voice, Your Money

VoicePay is a voice-enabled mobile money application designed to make financial transactions seamless and accessible. By leveraging voice commands, it empowers users to send money, check balances, and perform other mobile money operations using their preferred language.

---

## Features
- **Voice Recognition**: Perform transactions using simple voice commands.
- **Multilingual Support**: Handles commands in local languages like Luganda and English.
- **Secure Transactions**: Uses encryption for sensitive data and supports future biometric authentication.
- **User-Friendly Interface**: Minimalist design focused on accessibility.
- **Offline Capability**: Core features work without an active internet connection (in future iterations).

---

## Built With

### **Languages**
- JavaScript
- Markdown (for documentation)

### **Frameworks**
- React Native (cross-platform mobile development)
- Node.js (backend logic)

### **Cloud Services**
- **AWS Transcribe**: Converts voice to text.
- **AWS Lex**: Detects intents and extracts transaction details.
- **AWS Polly**: Provides verbal feedback to users.
- **AWS Lambda**: Serverless backend for processing commands.
- **AWS DynamoDB**: Simulated user accounts and transaction logs.
- **AWS Cognito**: User authentication and session management.
- **AWS Key Management Service (KMS)**: Encrypts sensitive data securely.

### **APIs and Libraries**
- **@react-native-community/voice**: Voice recognition library.
- Axios: Handles communication between app and backend.
- Mock APIs: Simulates telecom USSD responses.

### **Design Tools**
- Figma: For UI/UX design mockups.

---

## Installation

### Prerequisites
- Node.js and npm installed.
- React Native development environment set up.

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/drkNsubuga/voicepay.git
   cd voicepay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   npx react-native run-android # For Android
   npx react-native run-ios # For iOS
   ```

4. Install backend dependencies (if applicable):
   ```bash
   cd backend
   npm install
   ```

5. Deploy the backend to AWS Lambda:
   ```bash
   npm run deploy
   ```

---

## Usage
- Open the app on your device.
- Tap the microphone button and issue a voice command (e.g., "Send 20,000 shillings to John").
- Confirm the transaction when prompted.
- Receive verbal and on-screen feedback about the transaction status.

---

## Challenges
- Training accurate voice models for local languages.
- Integrating simulated USSD responses without direct API access.
- Ensuring a smooth user experience for all literacy levels.

---

## What's Next
- Add support for more Ugandan languages.
- Partner with telecom providers for direct API integrations.
- Enhance offline capabilities using AWS IoT Greengrass.



## License
This project is licensed under the MIT License. See the LICENSE file for details.
