/* eslint-disable no-bitwise */
import { useMemo, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleError, BleManager, Characteristic, Device } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';

import base64 from 'react-native-base64';
import { AccelerometerDataType } from './src/types';
import { base64ToHex, readFloat32 } from './utils';

interface AccelType {
  time: number;
  accelerometerData: AccelerometerDataType[];
}

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  writeToDevice: (data: string) => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  accel: AccelType;
  //
  huyna: any;
}

const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const READ_CHARACTERISTIC_UUID = '0000fff1-0000-1000-8000-00805f9b34fb';
const WRITE_CHARACTERISTIC_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';

const useBLE = (): BluetoothLowEnergyApi => {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [accel, setAccel] = useState<AccelType>({ time: 0, accelerometerData: [] });
  //TODO
  const [huyna, setHuyna] = useState<any>({});

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
      title: 'Location Permission',
      message: 'Bluetooth Low Energy requires Location',
      buttonPositive: 'OK',
    });

    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      },
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      },
    );

    return (
      bluetoothScanPermission === 'granted' &&
      bluetoothConnectPermission === 'granted' &&
      fineLocationPermission === 'granted'
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires Location',
          buttonPositive: 'OK',
        });
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted = await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };

  const onAccelUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
    if (error) {
      console.log(error);
      return;
    } else if (!characteristic?.value) {
      console.log('No data was received');
      return;
    }

    const rawData = base64ToHex(characteristic.value);

    if (!rawData.toUpperCase().startsWith('2D3E')) {
      console.log('Invalid packet start sequence');
      //TODO
      setHuyna({ ...huyna, FailedHeader: 'Failed Header!' });
      return;
    }

    const dataWithoutPrefix = rawData.substring(8).toUpperCase();

    if (dataWithoutPrefix.length % 24 !== 0) {
      console.log('Incomplete data chunk received');

      //TODO
      setHuyna({ ...huyna, FailedCountSymbols: 'Failed Count Symbols!' });
      return;
    }

    const accelerometerData = [];

    for (let i = 0; i < dataWithoutPrefix.length; i += 24) {
      const chunk = dataWithoutPrefix.substring(i, i + 24);
      const xValue = readFloat32(chunk, 0);
      const yValue = readFloat32(chunk, 8);
      const zValue = readFloat32(chunk, 16);

      accelerometerData.push({ x: xValue, y: yValue, z: zValue });
    }

    const time = Date.now();

    setAccel({ time: time, accelerometerData: accelerometerData });
    //TODO
    setHuyna({ ...huyna, AllGood: `All GOOD! ${time}` });
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(SERVICE_UUID, READ_CHARACTERISTIC_UUID, onAccelUpdate);
    } else {
      console.log('No Device Connected');
    }
  };

  const writeToDevice = async (data: string) => {
    //TODO
    setHuyna({ ...huyna, Test: data });
    if (connectedDevice) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const byteArray = new Uint8Array(data.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const base64String = base64.encodeFromByteArray(byteArray);

      await bleManager.writeCharacteristicWithoutResponseForDevice(
        connectedDevice.id,
        SERVICE_UUID,
        WRITE_CHARACTERISTIC_UUID,
        base64String,
      );
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    accel,
    writeToDevice,
    huyna,
  };
};

export default useBLE;
