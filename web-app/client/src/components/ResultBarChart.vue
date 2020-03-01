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
  created() {
    this.labels.forEach((label, index) => {
      this.dataCollection.datasets.push({
        label,
        data: [this.datas[index]],
        backgroundColor: this.getRandomColorStr(),
        barThickness: 30,
        borderWidth: 2,
        borderColor: 'white',
      });
    });
  },
  mounted() {
    this.renderChart(this.dataCollection, this.options);
  },
  data() {
    return {
      dataCollection: {
        labels: ['Count'],
        datasets: [],
      },
      options: {
        layout: {
          padding: 10,
        },
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
  methods: {
    getRandomColorStr() {
      return `#${Math.floor(Math.random() * 0xffffff).toString(16)}`;
    },
  },
};
</script>
