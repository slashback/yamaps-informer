import { 
  RECEIVE_ROUTES, 
  RECEIVE_CHARTS, 
  RECEIVE_ROUTE,
  EDIT_CHART_DESCRIPTION,
  EDIT_CHART_ROUTES,
  RECEIVE_CHART,
} from './actions'
import { combineReducers } from 'redux'

function routes(state = [], action) {
  switch (action.type) {
    case RECEIVE_ROUTES:
      return [
        ...action.payload,
      ]
    case RECEIVE_ROUTE:
      return [
        ...state.filter(route => {
          return route.uid !== action.payload.uid
        }),
        action.payload,
      ]
    default:
      return state
  }
}

function charts(state = [], action) {
  switch (action.type) {
    case RECEIVE_CHARTS:
      return [
        ...action.payload,
      ]
    case RECEIVE_CHART:
      return [
        action.chart,
        ...state.filter(item => item.uid !== action.chart.uid),
      ]
    default:
      return state
  }
}

export default combineReducers({
  routes,
  charts,
})