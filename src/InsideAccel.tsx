import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { AccelerometerDataType } from './types';
import { writeAccelDataToFile } from '../utils';

const InsideAccel = () => {
  const [dataBuffer, setDataBuffer] = useState<AccelerometerDataType[]>([]);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(accelerometerData => {
      setDataBuffer(prevBuffer => [...prevBuffer, accelerometerData]);

      if (dataBuffer.length === 9) {
        const packet = {
          time: Date.now(),
          accelerometerData: dataBuffer,
        };

        writeAccelDataToFile(packet, '/insideAccelData.txt');
        setDataBuffer([]);
      }
    });

    return () => subscription.remove();
  }, [dataBuffer]);

  return (
    <View style={styles.container}>
      <Text>Accel X: {dataBuffer[0]?.x.toFixed(3)}</Text>
      <Text>Accel Y: {dataBuffer[0]?.y.toFixed(3)}</Text>
      <Text>Accel Z: {dataBuffer[0]?.z.toFixed(3)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default InsideAccel;
