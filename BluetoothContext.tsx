import React, { createContext, useContext } from 'react';
import useBluetoothConnection from './useBluetoothConnection';
import { Peripheral } from 'react-native-ble-manager';

interface BluetoothContextType {
  peripherals: Map<string, Peripheral>;
  isScanning: boolean;
  startScan: () => void;
  connectPeripheral: (peripheralId: string) => Promise<void>;
  disconnectPeripheral: (peripheralId: string) => Promise<void>;
}

const BluetoothContext = createContext<BluetoothContextType | null>(null);

export const BluetoothProvider = (children: React.ReactElement) => {
  const bluetooth = useBluetoothConnection();

  return <BluetoothContext.Provider value={bluetooth}>{children}</BluetoothContext.Provider>;
};

export const useBluetooth = () => useContext(BluetoothContext);
