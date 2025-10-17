<script setup>
// file: src/components/UserRoleChart.vue
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { computed } from 'vue';

// Register the necessary components for Chart.js
ChartJS.register(Title, Tooltip, Legend, ArcElement);

// Define the props this component expects
const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

// Create a computed property to format the data for the chart
const data = computed(() => ({
  labels: Object.keys(props.chartData),
  datasets: [
    {
      backgroundColor: ['#0d6efd', '#198754'], // Blue and Green from Bootstrap
      data: Object.values(props.chartData)
    }
  ]
}));

// Define chart options
const options = {
  responsive: true,
  maintainAspectRatio: false
};
</script>

<template>
  <!-- Render the Doughnut chart -->
  <Doughnut :data="data" :options="options" />
</template>