import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router'
import './App.css';
import ChartPage from './components/chart_page'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router history={browserHistory}>
            <Route path="/" component={ChartPage} />
          </Router>
      </div>
    );
  }
}

export default App;
