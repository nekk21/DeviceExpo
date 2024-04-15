import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { AccelerometerDataType } from './types';
import { writeAccelDataToFile } from '../utils';

interface InsideAccelProps {
  started: boolean;
}

const InsideAccel = ({ started }: InsideAccelProps) => {
  const [dataBuffer, setDataBuffer] = useState<AccelerometerDataType[]>([]);
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(accelerometerData => {
      if (started) {
        Object.keys(accelerometerData).forEach(key => {
          accelerometerData[key] = Math.abs(accelerometerData[key]);
        });

        setDataBuffer(prevBuffer => [...prevBuffer, accelerometerData]);

        if (dataBuffer.length === 10) {
          const packet = {
            time: Date.now(),
            accelerometerData: dataBuffer,
          };

          setCounter(counter => counter + 1);

          writeAccelDataToFile(packet, '/insideAccelData.txt');
          setDataBuffer([]);
        }
      }
    });

    return () => subscription.remove();
  }, [dataBuffer, started]);

  return (
    <View style={styles.container}>
      <Text>Accel X: {dataBuffer[0]?.x.toFixed(3)}</Text>
      <Text>Accel Y: {dataBuffer[0]?.y.toFixed(3)}</Text>
      <Text>Accel Z: {dataBuffer[0]?.z.toFixed(3)}</Text>
      <Text>Local Counter:{counter} </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default InsideAccel;
