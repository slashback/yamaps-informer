import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'

class ChartItem extends Component {
  propTypes: {
    item: React.PropTypes.object.isRequired,
  }
  render () {
    const chartItem = this.props.item

    let colors = [
      ["#C709E0", "#C709E0"],
      ["rgba(75,192,192,0.4)", "rgba(75,192,192,1)"],
      ["rgba(255,99,132,0.2)", "rgba(255,99,132,1)"],
      ["rgba(179,181,198,0.2)", "rgba(179,181,198,1)"],
      ["#36a2eb", "#36a2eb"],
      ["#C709E0", "#C709E0"],
      ["#C709E0", "#C709E0"],
      ["rgba(75,192,192,0.4)", "rgba(75,192,192,1)"],
      ["rgba(255,99,132,0.2)", "rgba(255,99,132,1)"],
      ["rgba(179,181,198,0.2)", "rgba(179,181,198,1)"],
      ["#36a2eb", "#36a2eb"],
      ["#C709E0", "#C709E0"],
    ]

    const datasets = chartItem.data.map(function(item) {
      const color = colors.pop();
      return {
        label: item.name,
        data: item.values,
        fill: false,
        lineTension: 0.1,
        backgroundColor: color[0],
        borderColor: color[1],
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
      }
    })
    const chartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero:true
            }
          }
        ]
      }
    }

    const chartData = {
      labels: chartItem.labels,
      datasets: datasets
    }
    const longChart = chartItem.labels.length > 40
    const longChartStyle = { minWidth: "500px"}

    return (
      <div
        className="chart-item-wrapper"
        style={{
          overflowX: "auto",
        }}
      >
        <div
          className="chart"
          style={ longChart ? longChartStyle : {} }
        >
          <Line
            options={chartOptions}
            height={400}
            data={chartData}
          />
        </div>
        <hr
          style={{
            borderTop: "1px dotted #8c8b8b",
            margin: "30px 0",
          }}
        />
      </div>
    )
  }
}

export default ChartItem
