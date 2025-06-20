import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'transfer' | 'balance';
  amount: number;
  recipient?: string;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

export interface TransactionRequest {
  type: 'transfer' | 'balance';
  amount: number;
  recipient?: string;
  description: string;
}

export interface TransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

const STORAGE_KEYS = {
  TRANSACTIONS: '@voicepay_transactions',
  BALANCE: '@voicepay_balance',
};

const DEFAULT_BALANCE = 250000; // UGX 250,000

class TransactionServiceClass {
  async getBalance(): Promise<number> {
    try {
      const balanceStr = await AsyncStorage.getItem(STORAGE_KEYS.BALANCE);
      return balanceStr ? parseInt(balanceStr, 10) : DEFAULT_BALANCE;
    } catch (error) {
      console.error('Error getting balance:', error);
      return DEFAULT_BALANCE;
    }
  }

  async setBalance(balance: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
    } catch (error) {
      console.error('Error setting balance:', error);
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const transactionsStr = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!transactionsStr) return [];

      const transactions = JSON.parse(transactionsStr);
      return transactions.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      })).sort((a: Transaction, b: Transaction) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    try {
      const existingTransactions = await this.getTransactions();
      const updatedTransactions = [transaction, ...existingTransactions];
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.TRANSACTIONS,
        JSON.stringify(updatedTransactions)
      );
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }

  async processTransaction(request: TransactionRequest): Promise<TransactionResult> {
    try {
      const currentBalance = await this.getBalance();
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (request.type === 'transfer') {
        if (!request.recipient) {
          return {
            success: false,
            error: 'Recipient is required for transfers',
          };
        }

        if (request.amount <= 0) {
          return {
            success: false,
            error: 'Invalid amount',
          };
        }

        if (request.amount > currentBalance) {
          return {
            success: false,
            error: 'Insufficient balance',
          };
        }

        // Process transfer
        const newBalance = currentBalance - request.amount;
        await this.setBalance(newBalance);

        const transaction: Transaction = {
          id: this.generateTransactionId(),
          type: 'transfer',
          amount: request.amount,
          recipient: request.recipient,
          description: request.description,
          date: new Date(),
          status: 'completed',
        };

        await this.addTransaction(transaction);

        return {
          success: true,
          transaction,
        };
      } else if (request.type === 'balance') {
        const transaction: Transaction = {
          id: this.generateTransactionId(),
          type: 'balance',
          amount: currentBalance,
          description: request.description,
          date: new Date(),
          status: 'completed',
        };

        await this.addTransaction(transaction);

        return {
          success: true,
          transaction,
        };
      }

      return {
        success: false,
        error: 'Unknown transaction type',
      };
    } catch (error) {
      console.error('Error processing transaction:', error);
      return {
        success: false,
        error: 'Transaction processing failed',
      };
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Demo method to reset balance and transactions
  async resetAccount(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.BALANCE]);
    } catch (error) {
      console.error('Error resetting account:', error);
    }
  }
}

export const TransactionService = new TransactionServiceClass();