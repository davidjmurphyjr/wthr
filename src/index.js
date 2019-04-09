import map from 'lodash/map';
import xml2js from 'xml2js';
import Highcharts from 'highcharts';
import moment from 'moment';

var xhr = new XMLHttpRequest();

console.log('UNSENT', xhr.readyState); // readyState will be 0

xhr.open("GET", "https://forecast.weather.gov/MapClick.php?lat=42.3944&lon=-71.1165&FcstType=digitalDWML", true);
console.log('OPENED', xhr.readyState); // readyState will be 1

xhr.onprogress = function () {
    console.log('LOADING', xhr.readyState); // readyState will be 3
};

xhr.onload = function () {
    console.log('DONE', xhr.readyState); // readyState will be 4
    var element = document.createElement('div');
    document.body.appendChild(element);

    xml2js.parseString(xhr.response, function (err, result) {
      element = document.createElement('div');
      const data = result.dwml.data[0];
      console.log(data);
      makeGraph(data);
    });
};
    
xhr.send();

function makeGraph(data) {
  Highcharts.chart('container', {
    chart: {
      type: 'area'
    },
    title: {
      text: 'clouds and precip'
    },
    xAxis: {
      categories: map(data["time-layout"][0]["start-valid-time"], function (e) {return moment(e)}),
      labels: {
        formatter: function () {
          return this.value.toDate().getHours() % 3 === 0 && this.value.format("ddd") + ' ' + this.value.format("M/D");
        }
      },
      crosshair: {
        width: 1,
        color: 'green'
      }
    },
    yAxis: {
      title: {
        text: undefined
      },
      max: 100
    },
    series: [{
      name: 'cloud-amount',
      data: map(data.parameters[0]["cloud-amount"][0].value, function (e) { return Number(e) })
    }, {
      name: 'probability-of-precipitation',
      data: map(data.parameters[0]["probability-of-precipitation"][0].value, function (e) { return Number(e) })
    }],
    tooltip: {
      split: true,
      formatter: function () {
        // The first returned item is the header, subsequent items are the points
        return ['<b>' + this.x.format("hA") + '</b>'].concat(this.points.map(point =>  point.y))
      }
    }
  });
}
