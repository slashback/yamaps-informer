import { RECEIVE_ROUTES, RECEIVE_CHARTS } from './actions'
import { combineReducers } from 'redux'

function routes(state = [], action) {
  switch (action.type) {
    case RECEIVE_ROUTES:
      return [
        ...action.payload,
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
    default:
      return state
  }
}

export default combineReducers({
  routes,
  charts,
})