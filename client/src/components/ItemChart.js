import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ItemChart = ({ type, barData, pieData }) => {

  // Fallback for undefined data
  const chartData = type === 'bar'
    ? barData || {} // Object with warehouse keys for bar chart
    : pieData || { lowStock: 0, inStock: 0 }; // Stock status counts for pie chart

  // Process data differently for bar and pie charts
  const barLabels = type === 'bar' ? Object.keys(chartData) : [];
  const barValues = type === 'bar' ? barLabels.map(wh => chartData[wh]?.totalQuantity || 0) : [];

  const pieLabels = type === 'pie' ? ['Low Stock', 'In Stock'] : [];
  const pieValues = type === 'pie' ? [chartData.lowStock || 0, chartData.inStock || 0] : [];

  const data = {
    labels: type === 'bar' ? (barLabels.length > 0 ? barLabels : ['No Data']) : pieLabels,
    datasets: [
      {
        label: type === 'bar' ? 'Total Quantity' : 'Item Count',
        data: type === 'bar'
          ? barValues.length > 0 ? barValues : [0]
          : pieValues,
        backgroundColor: type === 'bar'
          ? barLabels.map((_, idx) =>
              `rgba(${idx * 50 % 255}, ${150 - idx * 30 % 255}, ${200 + idx * 20 % 255}, 0.2)`
            )
          : ['rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'], // Fixed colors for pie chart
        borderColor: type === 'bar'
          ? barLabels.map((_, idx) =>
              `rgba(${idx * 50 % 255}, ${150 - idx * 30 % 255}, ${200 + idx * 20 % 255}, 1)`
            )
          : ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom sizing
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: type === 'bar' ? 'Total Quantity by Warehouse' : 'Stock Status Distribution',
      },
    },
    scales: type === 'bar' ? {
      x: {
        ticks: { autoSkip: false }, // Ensure all labels are shown
        barPercentage: 0.7, // Adjust bar width (0 to 1)
        categoryPercentage: 0.8, // Adjust category spacing
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Quantity' },
      },
    } : {},
  };

  // Style for the chart container
  const chartStyle = type === 'pie' ? { width: '300px', height: '300px', margin: '0 auto' } : { height: '400px' }; // Increase height for bar chart

  return (
    <div style={chartStyle}>
      {type === 'bar' ? <Bar data={data} options={options} /> : <Pie data={data} options={options} />}
    </div>
  );
};

export default ItemChart;