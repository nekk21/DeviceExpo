import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import useBLE, { SpikeType } from '../useBle';
import { Device } from 'react-native-ble-plx';
import { writeAccelDataToFile } from '../utils';
import InsideAccel from './InsideAccel';

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
    disconnectFromDevice,
  } = useBLE();

  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [isStart, setStart] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);

  const [drivingType, setDrivingType] = useState<string>('Slow');

  const [spike, setSpike] = useState<SpikeType>({ bump: 0, stop: 0, pit: 0 });

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
    if (isStart) {
      if (accel && accel.accelerometerData && accel.accelerometerData.length > 0) {
        accel.spike = spike;
        accel.time = drivingType;
        writeAccelDataToFile(accel, '/accelData.txt');

        setSpike({ bump: 0, stop: 0, pit: 0 });
        setCounter(counter => counter + 1);
      }
    }
  }, [accel, isStart]);

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

  const handleDisconnect = async () => {
    await disconnectFromDevice();
    setIsConnected(false);
  };

  const handleSendData = async (data: string) => {
    await writeToDevice(data);
  };

  const handleToggler = () => {
    if (isStart) {
      setCounter(0);
      setStart(false);
      return;
    }
    setStart(true);
  };

  return (
    <View style={styles.container}>
      {!isConnected && (
        <Button title={isScanning ? 'Scanning...' : 'Start scan'} onPress={handleStartScan} disabled={isScanning} />
      )}

      {isConnected && <Button title='Disconnect' onPress={handleDisconnect} disabled={isScanning} />}

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

          <Button title={isStart ? 'Stop' : 'Start'} onPress={handleToggler} />
          <InsideAccel started={isStart} drivingType={drivingType} spike={spike} />
          <Text>Bluetooth Counter:{counter}</Text>

          <View style={styles.buttonContainer}>
            <Button title='Bump' onPress={() => setSpike({ bump: 1, stop: 0, pit: 0 })} />
            <Button title='Stop' onPress={() => setSpike({ bump: 0, stop: 1, pit: 0 })} />
            <Button title='Pit' onPress={() => setSpike({ bump: 0, stop: 0, pit: 1 })} />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              color={drivingType === 'Regular' ? 'green' : 'red'}
              title='Regular'
              onPress={() => setDrivingType('Regular')}
            />
            <Button
              color={drivingType === 'Slow' ? 'green' : 'red'}
              title='Slow'
              onPress={() => setDrivingType('Slow')}
            />
            <Button
              color={drivingType === 'Fast' ? 'green' : 'red'}
              title='Fast'
              onPress={() => setDrivingType('Fast')}
            />
            <Button
              color={drivingType === 'OffRoad' ? 'green' : 'red'}
              title='OffRoad'
              onPress={() => setDrivingType('OffRoad')}
            />
          </View>

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
