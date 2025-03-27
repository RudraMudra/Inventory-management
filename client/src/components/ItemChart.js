// client/src/components/ItemChart.js
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ItemChart = ({ type, barData, pieData, theme = 'light', setView, setFilter }) => { // Default to 'light'
  // Theme-based colors
  const chartColors = {
    light: {
      text: '#000',
      background: 'rgba(0, 0, 0, 0.1)',
      border: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
      text: '#fff',
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.5)',
    },
  };

  // Fallback for undefined data
  const chartData = type === 'bar'
    ? barData || {} // Object with warehouse keys for bar chart
    : pieData || { lowStock: 0, inStock: 0 }; // Stock status counts for pie chart

  // Process data for bar chart
  const barLabels = type === 'bar' ? Object.keys(chartData) : [];
  const barValues = type === 'bar' ? barLabels.map((wh) => chartData[wh]?.totalQuantity || 0) : [];

  // Process data for pie chart
  const pieLabels = type === 'pie' ? ['Low Stock', 'In Stock'] : [];
  const pieValues = type === 'pie' ? [chartData.lowStock || 0, chartData.inStock || 0] : [];
  const totalItems = type === 'pie' ? pieValues.reduce((sum, val) => sum + val, 0) : 0;

  // Data configuration for Chart.js
  const data = {
    labels: type === 'bar' ? (barLabels.length > 0 ? barLabels : ['No Data']) : pieLabels,
    datasets: [
      {
        label: type === 'bar' ? 'Total Quantity' : 'Item Count',
        data: type === 'bar' ? (barValues.length > 0 ? barValues : [0]) : pieValues,
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

  // Common chart options
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartColors[theme].text,
        },
      },
      title: {
        display: true,
        text: type === 'bar' ? 'Total Quantity by Warehouse' : 'Stock Status Distribution',
        color: chartColors[theme].text,
      },
      tooltip: {
        backgroundColor: chartColors[theme].background,
        titleColor: chartColors[theme].text,
        bodyColor: chartColors[theme].text,
        borderColor: chartColors[theme].border,
        borderWidth: 1,
      },
    },
  };

  // Bar chart specific options
  const barOptions = {
    ...baseOptions,
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          color: chartColors[theme].text,
        },
        barPercentage: 0.7,
        categoryPercentage: 0.8,
        title: {
          display: true,
          text: 'Warehouse',
          color: chartColors[theme].text,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity',
          color: chartColors[theme].text,
        },
        ticks: {
          color: chartColors[theme].text,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const warehouse = barLabels[index];
        setFilter({ warehouse }); // Set filter to show items in this warehouse
        setView('table'); // Navigate to the Items tab
      }
    },
  };

  // Pie chart specific options
  const pieOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = totalItems > 0 ? ((value / totalItems) * 100).toFixed(2) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const status = index === 0 ? 'lowStock' : 'inStock';
        setFilter({ status }); // Set filter to show low stock or in stock items
        setView('table'); // Navigate to the Items tab
      }
    },
  };

  // Style for the chart container
  const chartStyle =
    type === 'pie'
      ? { width: '300px', height: '300px', margin: '0 auto' }
      : { height: '400px', margin: '0 auto' };

  // Fallback for empty data
  if ((type === 'bar' && barLabels.length === 0) || (type === 'pie' && totalItems === 0)) {
    return (
      <div style={{ textAlign: 'center', color: chartColors[theme].text }}>
        No data available for this chart.
      </div>
    );
  }

  return (
    <div style={chartStyle}>
      {type === 'bar' && <Bar data={data} options={barOptions} />}
      {type === 'pie' && <Pie data={data} options={pieOptions} />}
    </div>
  );
};

export default ItemChart;