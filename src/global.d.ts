// TypeScript declarations for Web3/Ethereum wallet integration

interface EthereumProvider {
  isMetaMask?: boolean;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: (accounts: string[]) => void): void;
  removeListener(event: string, handler: Function): void;
  selectedAddress?: string;
  chainId?: string;
}

interface Window {
  ethereum?: EthereumProvider;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
