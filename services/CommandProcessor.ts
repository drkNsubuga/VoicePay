export interface CommandResult {
  success: boolean;
  type?: 'transfer' | 'balance';
  amount?: number;
  recipient?: string;
  error?: string;
  balance?: number;
}

class CommandProcessorClass {
  async processCommand(command: string): Promise<CommandResult> {
    try {
      const normalizedCommand = command.toLowerCase().trim();
      
      // Balance inquiry patterns
      const balancePatterns = [
        /check.*balance/i,
        /what.*balance/i,
        /my.*balance/i,
        /balance.*check/i,
        /show.*balance/i,
      ];

      for (const pattern of balancePatterns) {
        if (pattern.test(normalizedCommand)) {
          const { TransactionService } = await import('./TransactionService');
          const balance = await TransactionService.getBalance();
          return {
            success: true,
            type: 'balance',
            balance,
          };
        }
      }

      // Transfer patterns
      const transferPatterns = [
        /send\s+(\d+(?:,\d{3})*)\s+to\s+([a-zA-Z\s]+)/i,
        /transfer\s+(\d+(?:,\d{3})*)\s+to\s+([a-zA-Z\s]+)/i,
        /pay\s+([a-zA-Z\s]+)\s+(\d+(?:,\d{3})*)/i,
        /give\s+([a-zA-Z\s]+)\s+(\d+(?:,\d{3})*)/i,
      ];

      for (const pattern of transferPatterns) {
        const match = normalizedCommand.match(pattern);
        if (match) {
          let amount: number;
          let recipient: string;

          if (pattern.toString().includes('pay|give')) {
            // For "pay John 50000" or "give Mary 25000"
            recipient = match[1].trim();
            amount = parseInt(match[2].replace(/,/g, ''), 10);
          } else {
            // For "send 50000 to John" or "transfer 25000 to Mary"
            amount = parseInt(match[1].replace(/,/g, ''), 10);
            recipient = match[2].trim();
          }

          if (isNaN(amount) || amount <= 0) {
            return {
              success: false,
              error: 'Invalid amount specified',
            };
          }

          if (!recipient || recipient.length === 0) {
            return {
              success: false,
              error: 'Recipient name is required',
            };
          }

          // Capitalize recipient name
          recipient = recipient
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return {
            success: true,
            type: 'transfer',
            amount,
            recipient,
          };
        }
      }

      // If no pattern matches
      return {
        success: false,
        error: 'Command not recognized. Try "Send 50000 to John" or "Check my balance"',
      };
    } catch (error) {
      console.error('Error processing command:', error);
      return {
        success: false,
        error: 'Failed to process command',
      };
    }
  }

  // Get example commands for UI display
  getExampleCommands(): string[] {
    return [
      'Send 50000 to John',
      'Transfer 25000 to Mary',
      'Check my balance',
      'Pay David 100000',
      'Give Sarah 75000',
    ];
  }

  // Test if a command is likely to be understood
  canProcessCommand(command: string): boolean {
    const normalizedCommand = command.toLowerCase().trim();
    
    const allPatterns = [
      /check.*balance/i,
      /what.*balance/i,
      /my.*balance/i,
      /balance.*check/i,
      /show.*balance/i,
      /send\s+\d+.*to\s+[a-zA-Z]/i,
      /transfer\s+\d+.*to\s+[a-zA-Z]/i,
      /pay\s+[a-zA-Z].*\d+/i,
      /give\s+[a-zA-Z].*\d+/i,
    ];

    return allPatterns.some(pattern => pattern.test(normalizedCommand));
  }
}

export const CommandProcessor = new CommandProcessorClass();