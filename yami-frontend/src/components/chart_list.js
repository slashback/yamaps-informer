import React, { Component } from 'react'
import ChartItem from './chart_item'

class ChartList extends Component {
  propTypes: {
    chartList: React.PropTypes.array,
  }
  render() {
    const chartList = this.props.chartList || []
    return (
      <div
        style={{ overflowX: "auto"}}
      >
        {
          chartList.map(chart => (
            <ChartItem item={chart} />
          ))
        }
      </div>
    )
  }
}

export default ChartList
