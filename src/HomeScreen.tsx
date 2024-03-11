import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import InsideAccel from './InsideAccel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* <InsideAccel /> */}
      <Button title='View Saved Bluetooth Data' onPress={() => navigation.navigate('Data')} />
      <Button title='Best' onPress={() => navigation.navigate('Best')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
