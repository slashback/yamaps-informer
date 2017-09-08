import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import './App.css';
import ChartPage from './components/chart_page'
import AdminPage from './components/admin/admin_page'
import RouteEditPage from './components/admin/route_edit_page'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/skip/" component={ChartPage} />
            <Route path="/admin/route/:routeId" component={RouteEditPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/" component={ChartPage} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
