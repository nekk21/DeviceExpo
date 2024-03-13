import React, { useEffect, useState } from 'react';
import { Text, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { readDataFromFile } from '../utils';

const Metrics = () => {
  const screenWidth = Dimensions.get('window').width - 30;
  const [insideAccel, setInsideAccel] = useState(null);
  const [outsideAccel, setOutsideAccel] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insideData = await readDataFromFile('/insideAccelData.txt');
        setInsideAccel(insideData);
      } catch (error) {
        setInsideAccel([]);
        console.log('Error reading insideAccelData:', error);
      }

      try {
        const outsideData = await readDataFromFile('/accelData.txt');

        setOutsideAccel(outsideData);
      } catch (error) {
        setOutsideAccel([]);
        console.log('Error reading accelData:', error);
      }
    };

    fetchData();
  }, []);

  const prepareChartData = (data, color) => {
    if (!data?.length) {
      console.log('No data');
      return null;
    }

    const X = data.flatMap(item => item.accelerometerData.map(accel => accel.x));
    const Y = data.flatMap(item => item.accelerometerData.map(accel => accel.y));
    const Z = data.flatMap(item => item.accelerometerData.map(accel => accel.z));

    return ['X', 'Y', 'Z'].map((axis, index) => {
      return {
        labels: X.map((_, i) => String(i + 1)),
        datasets: [
          {
            data: axis === 'X' ? X : axis === 'Y' ? Y : Z,
            color: () => color,
            strokeWidth: 2,
          },
        ],
        legend: [`Accelerometer ${axis} Axis`],
      };
    });
  };

  const renderChart = (data, label) => {
    if (!data) {
      console.log('No data renderChart');
      return <Text>No Data for {label}</Text>;
    }

    return data.map((chartData, index) => (
      <LineChart
        key={index}
        data={chartData}
        width={screenWidth}
        height={220}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        yAxisInterval={1}
        fromZero={true}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        bezier
        style={styles.chart}
      />
    ));
  };

  const insideChartData = prepareChartData(insideAccel, 'rgba(0, 0, 255, 1)');
  const outsideChartData = prepareChartData(outsideAccel, 'rgba(255, 0, 0, 1)');

  return (
    <ScrollView style={styles.container}>
      {!!insideChartData && renderChart(insideChartData, 'Inside Accel')}
      {!!outsideChartData && renderChart(outsideChartData, 'Outside Accel')}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default Metrics;
