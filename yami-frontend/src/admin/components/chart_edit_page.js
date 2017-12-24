import React from 'react'
import { connect } from 'react-redux'
import NeedAuth from '../../auth/components/need_auth'
import ChartEdit from './chart_edit'
import RemoveChart from './chart_remove'
import { apiGetRoutes, apiGetCharts, apiSaveChart, apiRemoveChart } from '../actions'


class ChartEditPage extends React.Component {
    constructor(props) {
        super(props)
        this.onSaveChart = this.onSaveChart.bind(this)
        this.onRemoveChart = this.onRemoveChart.bind(this)
    }

    onRemoveChart(chartId) {
        this.props.removeChart(chartId)
    }

    componentWillMount() {
        this.props.initRoutes()
        this.props.initCharts()
        const chart = this.props.location.chart
        if (chart === undefined) {
            // api call
        } else {
            this.setState({
                uid: chart.uid,
                name: chart.name,
                description: chart.description,
                routes: chart.routes,
            })
        }
    }

    onSaveChart(chart) {
        this.props.saveChart(chart)
    }

    render() {
        const charts = this.props.charts
        const routes = this.props.routes
        const currChartId = parseInt(this.props.match.params.chartId, 10)
        let currentChart = charts.find(item => item.uid === currChartId)
        if (currentChart === undefined) {
            currentChart = {
                uid: "",
                name: "",
                description: "",
                routes: [],
            }
        }
        return (
            <NeedAuth>
                <RemoveChart 
                    chartId={this.state.uid}
                    onRemoveChart={this.onRemoveChart}
                />
                <ChartEdit 
                    chart={currentChart}
                    allRoutes={routes}
                    onSave={this.onSaveChart}
                />
            </NeedAuth>
        ) 
    }
}

const mapStateToProps = (state) => {
  return {
    routes: state.routes,
    charts: state.charts,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    initRoutes: () => {
      dispatch(apiGetRoutes())
    },
    initCharts: () => {
      dispatch(apiGetCharts())
    },
    saveChart: (chart) => {
      dispatch(apiSaveChart(chart))
    },
    removeChart: (chartId) => {
        dispatch(apiRemoveChart(chartId))
    }

  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartEditPage)
