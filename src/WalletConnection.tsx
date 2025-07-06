import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, LogOut } from 'lucide-react';

interface WalletConnectionProps {
  onWalletConnection?: (connected: boolean, account: string) => void;
  connected: boolean;
  onDisconnect?: () => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  onWalletConnection,
  connected,
  onDisconnect
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(connected);

  const checkWalletConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length > 0) {
      setIsConnected(true);
      if (onWalletConnection) {
        onWalletConnection(true, accounts[0]);
      }
    } else {
      setIsConnected(false);
      if (onWalletConnection) {
        onWalletConnection(false, '');
      }
    }
  }, [onWalletConnection]);

  const handleChainChanged = useCallback(() => {
    // Chain changed - could implement network validation here if needed
    console.log('Chain changed');
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        setIsConnected(true);
        
        if (onWalletConnection) {
          onWalletConnection(true, accounts[0]);
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      // Note: MetaMask doesn't provide a direct "disconnect" method
      // The best practice is to clear local state and let the user manually disconnect in MetaMask
      // Or use the newer requestPermissions API to revoke permissions if available
      
      if (typeof window.ethereum !== 'undefined' && window.ethereum.request) {
        try {
          // Try to revoke permissions if supported (newer MetaMask versions)
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{
              eth_accounts: {}
            }]
          });
        } catch (revokeError) {
          // If revokePermissions is not supported, that's okay
          // We'll just clear local state
          console.log('Permission revocation not supported, clearing local state only');
        }
      }
      
      // Clear local state
      setIsConnected(false);
      if (onWalletConnection) {
        onWalletConnection(false, '');
      }
      if (onDisconnect) {
        onDisconnect();
      }
      
      // Show a message to the user about manual disconnection
      alert('To fully disconnect, please also disconnect from this site in your MetaMask wallet settings.');
      
    } catch (error) {
      console.error('Error during disconnect:', error);
      // Still clear local state even if wallet disconnect fails
      setIsConnected(false);
      if (onWalletConnection) {
        onWalletConnection(false, '');
      }
      if (onDisconnect) {
        onDisconnect();
      }
    }
  };

  useEffect(() => {
    checkWalletConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [handleAccountsChanged, handleChainChanged, checkWalletConnection]);

  // Simple wallet button component
  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      onClick={disconnectWallet}
      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
    >
      <LogOut className="w-5 h-5" />
      Disconnect Wallet
    </button>
  );
};

export default WalletConnection; 