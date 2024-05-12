import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { AccelerometerDataType } from './types';
import { writeAccelDataToFile } from '../utils';

interface InsideAccelProps {
  started: boolean;
  drivingType: string;
}

const InsideAccel = ({ started, drivingType }: InsideAccelProps) => {
  const dataBufferRef = useRef<AccelerometerDataType[]>([]);
  const [counter, setCounter] = useState<number>(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener(accelerometerData => {
      if (started) {
        Object.keys(accelerometerData).forEach(key => {
          accelerometerData[key] = Math.abs(accelerometerData[key]);
        });

        dataBufferRef.current.push(accelerometerData);

        if (dataBufferRef.current.length === 10) {
          const packet = {
            time: drivingType,
            accelerometerData: dataBufferRef.current,
          };

          writeAccelDataToFile(packet, '/insideAccelData.txt');
          dataBufferRef.current = [];
          setCounter(counter => counter + 1);
        }
      }
    });

    return () => subscription.remove();
  }, [started]);

  return (
    <View style={styles.container}>
      <Text>Accel X: {dataBufferRef.current[0]?.x.toFixed(3)}</Text>
      <Text>Accel Y: {dataBufferRef.current[0]?.y.toFixed(3)}</Text>
      <Text>Accel Z: {dataBufferRef.current[0]?.z.toFixed(3)}</Text>
      <Text>Local Counter: {counter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default InsideAccel;
