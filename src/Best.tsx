import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useBLE from '../useBle';
import { Device } from 'react-native-ble-plx';
import { writeAccelDataToFile } from '../utils';

const Best = () => {
  const {
    scanForPeripherals,
    connectToDevice,
    writeToDevice,
    allDevices,
    connectedDevice,
    accel,
    requestPermissions,
    huyna,
  } = useBLE();

  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        Alert.alert('Permissions required', 'This app needs Bluetooth permissions to work.');
      }
    };
    getPermissions();
  }, []);

  useEffect(() => {
    if (accel && accel.accelerometerData && accel.accelerometerData.length > 0) {
      writeAccelDataToFile(accel, '/accelData.txt');
    }
  }, [accel]);

  const handleStartScan = () => {
    setIsScanning(true);
    scanForPeripherals();

    setTimeout(() => {
      setIsScanning(false);
    }, 5000); // scan 5s
  };

  const handleConnectToDevice = async (device: Device) => {
    await connectToDevice(device);
    setIsConnected(true);
  };

  const handleSendData = async (data: string) => {
    await writeToDevice(data);
  };

  return (
    <View style={styles.container}>
      {!isConnected && (
        <Button title={isScanning ? 'Scanning...' : 'Start scan'} onPress={handleStartScan} disabled={isScanning} />
      )}

      {!isConnected && !isScanning && (
        <FlatList
          data={allDevices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.deviceCard} onPress={() => handleConnectToDevice(item)}>
              <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
              <Text>{item.id}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {isConnected && connectedDevice && (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedDeviceName}>{connectedDevice.name || 'Connected Device'}</Text>

          <View style={styles.buttonContainer}>
            <Button title='Send 1' onPress={() => handleSendData('2D3E000000')} />
            <Button title='Send 2' onPress={() => handleSendData('2D3E000002')} />
            <Button title='Send 3' onPress={() => handleSendData('2D3E000004')} />
          </View>

          {!!huyna && <Text style={styles.dataDisplay}>{!!huyna.Test && huyna.Test}</Text>}
          {!!huyna && <Text style={styles.dataDisplay}>{!!huyna.FailedHeader && huyna.FailedHeader}</Text>}
          {!!huyna && <Text style={styles.dataDisplay}>{!!huyna.FailedCountSymbols && huyna.FailedCountSymbols}</Text>}
          {!!huyna && <Text style={styles.dataDisplay}>{!!huyna.AllGood && huyna.AllGood}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  deviceCard: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  deviceName: {
    fontWeight: 'bold',
  },
  connectedDeviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dataDisplay: {
    fontSize: 16,
  },
});

export default Best;
