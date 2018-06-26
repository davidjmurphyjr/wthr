import join from 'lodash/join';
import xml2js from 'xml2js';
import Highcharts from 'highcharts';

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
      console.log(result);
      makeGraph(element);
    });
};
    
xhr.send();

function makeGraph(element) {
  Highcharts.chart('container', {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Fruit Consumption'
    },
    xAxis: {
      categories: ['Apples', 'Bananas', 'Oranges']
    },
    yAxis: {
      title: {
        text: 'Fruit eaten'
      }
    },
    series: [{
      name: 'Jane',
      data: [1, 0, 4]
    }, {
      name: 'John',
      data: [5, 7, 3]
    }]
  });
}
