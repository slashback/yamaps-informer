// import { Redirect } from 'react-router'
// import React from 'react'
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
            apiGet('/api/routes').then(function(rawRoutes) {
                const routes = rawRoutes.map(prepareGetRoute, rawRoutes)
                dispatch(receiveRoutes(routes))
        })
     }
}

export const apiGetCharts = () => {
        return function (dispatch, getState) {
            apiGet('/api/charts').then(function(rawCharts) {
                const charts = rawCharts.map(prepareGetChart, rawCharts)
                dispatch(receiveCharts(charts))
        })
     }
}

export const apiSaveRoute = (route) => {
    return function(dispatch, getState) {
        console.log('API CALL', prepareSaveRoute(route))
        const url = `/api/route/${route.uid}`
        apiPost(url, prepareSaveRoute(route)).then(function (response) {
            // TODO: ok or err
            dispatch(editRoute(route))
            history.push('/admin')
        })   
    }
}