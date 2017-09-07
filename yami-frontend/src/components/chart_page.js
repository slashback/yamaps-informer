import React, { Component } from 'react'
import ChartList from './chart_list'
import request from 'superagent'

class ChartPage extends Component {

  constructor(props) {
        super(props);
        this.state = {
          charts: [],
        };
     }

     componentDidMount() {
         var self = this
         const daysAgo = this.props.params.daysAgo || 0
         const chartsUrl = `/api/charts/${daysAgo}`
         request.get(chartsUrl).end(function(err, res){
           const chartList = res.body.chart_list
           self.setState({
             charts: chartList
           })
        });
     }

  render() {
    // eslint-disable-next-line
    const testData = [
      {
        name: 'Work',
        labels: [
          "05:00", "05:05", "05:10", "05:15", "05:20", "05:25", "05:30", "05:35", "05:40", "05:45",
        ],
        data: [
          { name: "per", values: [28, 28, 27, 27, 25, 25, 25, 25, 25, 25, ]},
          { name: "you", values: [23, 22, 23, 22, 21, 20, 21, 21, 21, 20, ]},
          { name: "bor", values: [19, 19, 19, 19, 19, 19, 19, 19, 19, 18, ]},
          { name: "yar", values: [30, 29, 29, 30, 30, 30, 30, 29, 29, 29, ]},
          { name: "vol", values: [14, 15, 14, 15, 15, 14, 14, 14, 14, 14, ]},
          { name: "\u0412\u0435\u0448\u043a\u0438", values: [50, 49, 49, 49, 49, 51, 51, 50, 47, 44, ]}
        ]
      },
      {
        name: 'Dacha',
        labels: [
          "05:00", "05:05", "05:10", "05:15", "05:20", "05:25", "05:30", "05:35", "05:40", "05:45",
        ],
        data: [
          { name: "yar", values: [30, 29, 29, 30, 30, 30, 30, 29, 29, 29, ]},
          { name: "vol", values: [14, 15, 14, 15, 15, 14, 14, 14, 14, 14, ]},
        ]
      },
      {
        name: 'Smth',
        labels: [
          "05:00", "05:05", "05:10", "05:15", "05:20", "05:25", "05:30", "05:35", "05:40", "05:45",
        ],
        data: [
          { name: "per", values: [28, 28, 27, 27, 25, 25, 25, 25, 25, 25, ]},
          { name: "vol", values: [14, 15, 14, 15, 15, 14, 14, 14, 14, 14, ]},
          { name: "\u0412\u0435\u0448\u043a\u0438", values: [50, 49, 49, 49, 49, 51, 51, 50, 47, 44, ]}
        ]
      },
    ]
    return (
      <div>
        <div
          style={{ padding: "10px 0" }}
        >
          <span
            style={{
              fontSize: "20px",
              fontFamily: "Georgia",
              color: "#707070",
            }}
          >
            Нельзя просто так взять и выехать из Мытищ
          </span>
        </div>
        <ChartList
          chartList={this.state.charts}
        />
      </div>
    )
  }
}




export default ChartPage
