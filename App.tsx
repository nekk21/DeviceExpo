import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/HomeScreen';
import DataScreen from './src/DataScreen';
import Best from './src/Best';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen name='Home' component={HomeScreen} options={{ title: 'Real-Time Data' }} />
        <Stack.Screen name='Data' component={DataScreen} options={{ title: 'Saved Data' }} />
        <Stack.Screen name='Best' component={Best} options={{ title: 'Best' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
