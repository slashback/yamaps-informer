import React from 'react'
import { connect } from 'react-redux'
import NeedAuth from '../../auth/components/need_auth'
import ChartEdit from './chart_edit'
import { apiGetRoutes, apiGetCharts } from '../actions'


class ChartEditPage extends React.Component {
    constructor(props) {
        super(props)
        this.onSaveChart = this.onSaveChart.bind(this)
    }

    componentWillMount() {
        this.props.initRoutes()
        this.props.initCharts()
    }

    onSaveChart(chart) {
        console.log(chart)
    }

    render() {
        const charts = this.props.charts
        const routes = this.props.routes
        const currChartId = this.props.match.params.chartId
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
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartEditPage)
