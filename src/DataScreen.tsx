import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, FlatList, Button, View } from 'react-native';
import { AccelerometerDataType } from './types';
import { deleteAccelDataFile, readDataFromFile } from '../utils';

const DataScreen: React.FC = () => {
  const [data, setData] = useState<AccelerometerDataType[]>([]);

  const deleteHandler = () => {
    deleteAccelDataFile('accelData.txt');
    deleteAccelDataFile('insideAccelData.txt');
    setData([]);
  };

  useEffect(() => {
    const loadData = async () => {
      // const fileData = await readDataFromFile('/accelData.txt');
      const fileData = await readDataFromFile('/insideAccelData.txt');

      console.log('fileData', fileData[0]);

      setData(fileData);
    };

    loadData();
  }, []);

  const renderItem = ({ item }: { item: { timestamp: string; accelerometerData: AccelerometerDataType[] } }) => {
    return (
      <View style={styles.packetContainer}>
        <Text style={styles.timestamp}>Timestamp: {item.timestamp}</Text>
        {item.accelerometerData.map((accel, index) => (
          <Text key={index} style={styles.accelData}>
            X: {accel.x.toFixed(3)}, Y: {accel.y.toFixed(3)}, Z: {accel.z.toFixed(3)}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <>
      <View>
        <Button title='Delete Data' onPress={deleteHandler} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={styles.container}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  packetContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  timestamp: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default DataScreen;
