import history from '../history'
import 'whatwg-fetch'

export const RECEIVE_ROUTES = "RECEIVE_ROUTES"
export const receiveRoutes = (routes) => {
    return {
        type: RECEIVE_ROUTES,
        payload: routes,
    }
}

export const RECEIVE_ROUTE = "RECEIVE_ROUTE"
export const editRoute = (route) => {
    return {
        type: RECEIVE_ROUTE,
        payload: route
    }
}

export const RECEIVE_CHARTS = "RECEIVE_CHARTS"
export const receiveCharts = (charts) => {
    return {
        type: RECEIVE_CHARTS,
        payload: charts,
    }
}

export const RECEIVE_CHART = "RECEIVE_CHART"
export const receiveChart = (chart) => {
    return {
        type: RECEIVE_CHART,
        chart,
    }
}

export const REMOVE_CHART = "REMOVE_CHART"
export const removeChart = (chartId) => {
    return {
        type: REMOVE_CHART,
        chartId,
    }
}

export const REMOVE_ROUTE = "REMOVE_ROUTE"
export const removeRoute = (routeId) => {
    return {
        type: REMOVE_ROUTE,
        routeId,
    }
}

export const EDIT_CHART_DESCRIPTION = "EDIT_CHART_DESCRIPTION"
export const editChartDescription = (chartId, description) => {
    return {
        type: EDIT_CHART_DESCRIPTION,
        chartId,
        description,
    }
}

export const EDIT_CHART_ROUTES = "EDIT_CHART_ROUTES"
export const editChartRoutes = (chartId, routes) => {
    return {
        type: EDIT_CHART_ROUTES,
        chartId,
        routes,
    }
}

const apiGet = (url) => {
    return fetch(url).then(function(response) {
        return response.json()
    }).then(function(json) {
        return json
    })
}

const apiPost = (url, data) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(function(response) {
        return response.json()
    }).then(function(json) {
        return json
    })
}

const prepareGetChart = (chart) => {
    return {
        ...chart,
        routes: JSON.parse(chart.routes),
    }
}

const prepareGetRoute = (route) => {
    return {
        ...route,
        waypoints: JSON.parse(route.waypoints),
    }
}

const prepareSaveRoute = (route) => {
    return {
        ...route,
        uid: parseInt(route.uid, 10),
        waypoints: JSON.stringify(route.waypoints),
    }
}

export const apiGetRoutes = () => {
    return function (dispatch, getState) {
            apiGet('/api/get-routes/').then(function(rawRoutes) {
                const routes = rawRoutes.map(prepareGetRoute, rawRoutes)
                dispatch(receiveRoutes(routes))
        })
     }
}

export const apiGetCharts = () => {
        return function (dispatch, getState) {
            apiGet('/api/get-charts/').then(function(rawCharts) {
                const charts = rawCharts.map(prepareGetChart, rawCharts)
                dispatch(receiveCharts(charts))
        })
     }
}

export const apiSaveRoute = (route) => {
    return function(dispatch, getState) {
        const routeId = route.uid || ""
        const url = `/api/update-route/`
        const prepared = prepareSaveRoute(route)
        const routeData = {
            ...prepareSaveRoute(route),
            uid: prepared.uid || null,
        }
        apiPost(url, routeData).then(function (response) {
            // TODO: ok or err
            dispatch(editRoute(route))
            history.push('/admin')
        })   
    }
} 

export const apiSaveChart = (chart) => {
    return function(dispatch, getState) {
        const url = `/api/update-chart/`
        const chartData = {
            name: chart.name,
            description: chart.description,
            routes: chart.routes,
        }
        if (chart.uid !== "") {
            chartData["uid"] = chart.uid
        }
        apiPost(url, chartData).then(function (response) {
            // TODO: ok or err
            chart.uid = response.uid
            dispatch(receiveChart(chart))
            history.push('/admin')
        })
    }
}

export const apiRemoveChart = (chartId) => {
    return function(dispatch, getState) {
        const url = `/api/remove-chart/`
        const chartData = {
            uid: chartId,
        }
        apiPost(url, chartData).then(function (response) {
            // TODO: ok or err
            chartId = response.uid
            dispatch(removeChart(chartId))
            history.push('/admin')
        })
    }
}

export const apiRemoveRoute = (routeId) => {
    return function(dispatch, getState) {
        const url = `/api/remove-route/`
        const routeData = {
            uid: routeId,
        }
        apiPost(url, routeData).then(function (response) {
            // TODO: ok or err
            routeId = response.uid
            dispatch(removeRoute(routeId))
            history.push('/admin')
        })
    }
}