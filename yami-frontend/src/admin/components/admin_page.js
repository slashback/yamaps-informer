import React from 'react'
import { connect } from 'react-redux'
import NeedAuth from '../../auth/components/need_auth'
import ChartList from './chart_list'
import RouteList from './route_list'
import { apiGetRoutes, apiGetCharts } from '../actions'

const prepareChartData = (charts, routes) => {
    return charts.map(chart => {
        return {
            ...chart,
            routes: chart.routes.map(routeId => {
                return routes.find(route => route.uid === routeId)
            })
        }
    })
}

class AdminPage extends React.Component {
    componentWillMount() {
        this.props.initCharts()
        this.props.initRoutes()
    }

    render() {
        const charts = prepareChartData(this.props.charts, this.props.routes)
        const routes = this.props.routes
        console.log("PREPARE CH", charts)
        console.log('PREPARE ROU', routes)
    return (
        <NeedAuth>
            <div
                style={{
                    display: "flex",
                    margin: "10px",
                }}
            >
                <ChartList charts={charts} />
                <RouteList routes={routes} />
            </div>
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
)(AdminPage)
