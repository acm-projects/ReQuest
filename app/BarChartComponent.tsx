// BarGraphComponent.tsx
import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface BarGraphProps {
  data: Record<string, number>;
}

const BarGraphComponent: React.FC<BarGraphProps> = ({ data }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        colors: [
          (opacity = 1) => '#369054', // green
          (opacity = 1) => '#BCD6B7', // light green
          (opacity = 1) => '#A0DAE8', // light blue
          (opacity = 1) => '#3C7E7E', // teal
          (opacity = 1) => '#4DA99A', // seafoam green
          (opacity = 1) => '#81CA99', // mint green
        ]
      }
    ]
  };

  const chartConfig = {
    backgroundColor: '#FFFBF1',
    backgroundGradientFrom: '#FFFBF1',
    backgroundGradientTo: '#FFFBF1',
    decimalPlaces: 0,
    color: (opacity = 1) => '#000000', // Changed to black for numbers
    labelColor: (opacity = 1) => '#400908',
    barPercentage: 0.8,
    strokeWidth: 0,
    propsForLabels: {
      fontFamily: 'Gilroy',
      fontSize: 12,
    }
  };

  return (
    <View style={{
      backgroundColor: '#FFFBF1',
      padding: 16,
      borderRadius: 20,
      marginHorizontal: 10,
    }}>
      <Text style={{ 
        fontSize: 18, 
        textAlign: 'center', 
        marginVertical: 10,
        fontFamily: 'Gilroy',
        color: '#400908',
        fontWeight: '600',
      }}>
        Recycling Stats
      </Text>
      <BarChart
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig}
        verticalLabelRotation={0}
        showValuesOnTopOfBars
        fromZero
        flatColor={true}
        withInnerLines={false}
        segments={5}
        withCustomBarColorFromData={true}
      />
    </View>
  );
};

export default BarGraphComponent;