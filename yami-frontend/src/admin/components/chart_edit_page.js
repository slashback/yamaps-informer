import React from 'react'
import { connect } from 'react-redux'
import NeedAuth from '../../auth/components/need_auth'
// import ChartList from './chart_list'
// import RouteList from './route_list'
import { apiGetRoutes, apiGetCharts } from '../actions'


class ChartEditPage extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.onChangeName = this.onChangeName.bind(this)
        this.onChangeDescription = this.onChangeDescription.bind(this)
        this.state = {
            uid: "",
            name: "",
            description: "",
            routes: [3, 4],
        }
    }

    componentWillMount() {
        this.props.initRoutes()
        this.props.initCharts()
        const chartId = parseInt(this.props.match.params.chartId, 10)
        if (chartId === undefined) {
            // new chart
        } else {
            this.setState({
                uid: chartId
            })
            // const currChart = this.props.charts.filter(
            //     item => item.uid === chartId
            // )[0]
            // console.log('ASYNC', currChart)
            // currChart = t
            // console.log('======', this.props.charts)
            // this.setState({
            //     name: chart.name,
            //     description: chart.description,
            //     routes: chart.routes,
            // })
        }
    }

    handleChange(event) {
        console.log(event.target.checked)
        console.log(event.target.value)
        const checked = event.target.checked
        const routeId = parseInt(event.target.value, 10)
        if (checked === true) {
            console.log('CHECKED')
            this.setState({
                routes: [
                    ...this.state.routes,
                    routeId,
                ]
            })
        } else {
            this.setState({
                routes: this.state.routes.filter(item => item !== routeId)
            })
        }
    }

    onChangeName(value) {
        this.setState({
            name: value
        })
    }

    onChangeDescription(value) {
        this.setState({
            description: value
        })
    }

    render() {
        const charts = this.props.charts
        const routes = this.props.routes
        console.log("PREPARE CH", charts)
        console.log(this.state.uid)
        // const currChart = this.props.charts.filter(
        //     item => item.uid === this.state.uid
        // )[0]
        // if (currChart !== undefined) {
        //     this.setState({
        //         name: currChart.name,
        //         description: currChart.description,
        //         routes: currChart.routes,
        //     })
        // }
        // console.log('_+_+', currChart)
        
        // console.log(currChart)
        // console.log('PREPARE ROU', routes)
        // console.log(this.state.routes)
        return (
            <NeedAuth>
                <div
                    style={{
                        display: "flex",
                        margin: "10px auto",
                        flexDirection: "column",
                        width: "300px",
                    }}
                >
                    <input
                        placeholder="Название" 
                        id="name" 
                        type="text" 
                        value={this.state.name}
                        onChange={(e) => this.onChangeName(e.target.value)}
                        style={{
                            margin: "5px 0",
                            height: "30px",
                        }}
                    />
                    <input
                        placeholder="Описание" 
                        id="description" 
                        type="text" 
                        value={this.state.description}
                        onChange={(e) => this.onChangeDescription(e.target.value)}
                        style={{
                            margin: "5px 0",
                            height: "30px",
                        }}
                    />
                    <ul>
                        {routes.map(route => {
                            const isChecked = this.state.routes.includes(route.uid)
                            return (
                                <li
                                    className="route-item-wrapper"
                                    style={{
                                        margin: "5px 0",
                                        display: "flex",
                                    }}
                                    key={route.uid}
                                >
                                    <div
                                        style={{
                                            flexGrow: 1,
                                        }}
                                    >
                                        {route.name}
                                    </div>
                                    <div
                                        className="route-item-actions"
                                    >
                                        <span 
                                            className="chart_item_action"
                                            style={{
                                                margin: "0 5px",
                                            }}
                                        >
                                            <input
                                                type="checkbox" 
                                                id={route.uid} 
                                                value={route.uid}
                                                checked={isChecked}
                                                onChange={this.handleChange}
                                            />
                                        </span>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
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
)(ChartEditPage)
