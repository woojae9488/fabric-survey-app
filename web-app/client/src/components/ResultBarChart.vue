<script>
import { HorizontalBar } from 'vue-chartjs';

export default {
  extends: HorizontalBar,
  name: 'result-bar-chart',
  props: {
    labels: {
      type: Array,
      required: true,
    },
    datas: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      dataCollection: {
        labels: ['Count'],
        datasets: [],
      },
      options: {
        layout: { padding: 10 },
        tooltips: { mode: 'single' },
        scales: {
          yAxes: [{ stacked: true }],
          xAxes: [
            {
              ticks: { beginAtZero: true, stepSize: 1 },
              gridLines: { display: false },
              stacked: true,
            },
          ],
        },
        legend: { display: false },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  created() {
    this.fillDatasets();
  },
  mounted() {
    this.renderChart(this.dataCollection, this.options);
  },
  methods: {
    getRandomColorStr() {
      return `#${Math.floor(Math.random() * 0xffffff).toString(16)}`;
    },
    fillDatasets() {
      this.labels.forEach((label, index) => {
        this.dataCollection.datasets.push({
          label,
          data: [this.datas[index]],
          backgroundColor: this.getRandomColorStr(),
          barThickness: 30,
          borderColor: 'white',
          borderWidth: 2,
        });
      });
    },
  },
};
</script>
