import xml2js from 'xml2js';
import Highcharts from 'highcharts';
import ReactDOM from 'react-dom'
import Hello from "./Hello";
import React from "react";
import debounce from 'lodash.debounce';
import './style.css'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const height = null


function getDates(data) {
  let dates = data["time-layout"][0]["start-valid-time"];
  const startDateString = dates[0];
  const start = new Date(startDateString);
  return {dates, start};
}

function getXAxis(dates) {
  return {
    type: 'datetime',
    labels: {enabled: false},
    crosshair: {width: 1, color: 'green'},
    plotBands: dates.reduce((acc, d, i) => {
      const date = new Date(d);
      if (date.getHours() === 0 && dates.length - i > 24) {
        const plotBand = { // Light air
          from: date,
          to: new Date(date.getTime()).setHours(23, 59, 59),
          label: {text: days[date.getDay()],}
        };
        acc.push(plotBand)
      }
      return acc;
    }, []),
    plotLines: dates.reduce((acc, d) => {
      const date = new Date(d);
      if (date.getHours() === 0) {
        const plotBand = {color: 'black', value: date, width: 1};
        acc.push(plotBand)
      }
      return acc;
    }, [])

  };
}

function buildTemperatureChart(data) {
  const {dates, start} = getDates(data);
  Highcharts.setOptions({time: {useUTC: false}});

  const options = {
    chart: {
      height: height,
      type: 'line'
    },
    title: { text: null },
    legend:{ enabled:false },
    plotOptions: getPlotOptions(start),
    xAxis: getXAxis(dates),
    yAxis: {
      title: {text: undefined},
    },
    series: [
      {
        name: 'Dew Point',
        data: data.parameters[0]["temperature"][0].value.map(e => Number(e)),
        color: '#d32431'
      },
      {
        name: "Wind Chill",
        data: data.parameters[0]["temperature"][1].value.map(e => Number(e)),
        color: '#ab579f'
      }, {
        name: 'Temperature',
        data: data.parameters[0]["temperature"][2].value.map(e => Number(e)),
        color: '#5d9e4e'
      }
    ],
    tooltip: {
      split: true,
      xDateFormat: "%A, %b %e, %I:%M%p"
    },
  };

  Highcharts.chart("temperature-chart", options);
}


function getPlotOptions(start) {
  return {
    series: {
      pointStart: start.getTime(),
      pointInterval: 60 * 60 * 1000,
      marker: {enabled: false}
    }
  };
}

function buildCloudsAndPrecipitationChart(data) {
  const {dates, start} = getDates(data);
  Highcharts.setOptions({time: {useUTC: false}});

  const options = {
    chart: {
      height: height,
      type: 'area'
    },
    title: { text: null },
    legend:{ enabled:false },
    plotOptions: getPlotOptions(start),
    xAxis: getXAxis(dates),
    yAxis: {
      title: {text: undefined},
      max: 100
    },
    series: [{
      name: 'Cloud Cover',
      data: data.parameters[0]["cloud-amount"][0].value.map(e => Number(e)),
      color: '#a3a3a3'
    }, {
      name: 'Probability of Precipitation',
      data: data.parameters[0]["probability-of-precipitation"][0].value.map(e => Number(e)),
      color: '#25abda'
    }],
    tooltip: {
      split: true,
      xDateFormat: "%A, %b %e, %I:%M%p"
    },
  };
  Highcharts.chart("clouds-and-precipitation-chart", options);
}

function buildWindChart(data) {
  const {dates, start} = getDates(data);
  Highcharts.setOptions({time: {useUTC: false}});

  const options = {
    chart: {
      height: height,
      type: 'line'
    },
    title: { text: null },
    legend:{ enabled:false },
    plotOptions: getPlotOptions(start),
    xAxis: getXAxis(dates),
    yAxis: {
      title: {text: undefined},
    },
    series: [{
      name: 'Sustained',
      data: data.parameters[0]["wind-speed"][0].value.map(e => Number(e)),
      color: '#981497'
    }, {
      name: 'Gusts',
      data: data.parameters[0]["wind-speed"][1].value.map(e => Number(e)),
      color: '#010757'
    }],
    tooltip: {
      split: true,
      xDateFormat: "%A, %b %e, %I:%M%p"
    },
  };
  Highcharts.chart("wind-chart", options);
}

(async () => {
  try {
    let locationQuery = '';
    let locations = [];
    const rootDomElement = document.getElementById('react-root');
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lon = urlParams.get('lon');
    let data;
    if (lat && lon) {
      const url = `https://forecast.weather.gov/MapClick.php?lat=${lat}4&lon=${lon}&FcstType=digitalDWML`;
      const response = await fetch(url);
      const text = await response.text();
      const result = await xml2js.parseStringPromise(text);
      data = result.dwml.data[0];
    }

    const render = () => {
      const city = data?.location[0]?.city?.[0]?._;
      const areaDescription = data?.location[0]?.['area-description']?.[0];
      const locationDescription = city || areaDescription;
      const rootReactComponent = <Hello
        locationQuery={locationQuery}
        locations={locations}
        updateLocationQuery={updateLocationQuery}
        locationDescription={locationDescription}
      />;
      return ReactDOM.render(rootReactComponent, rootDomElement);
    };

    const geocode = debounce(async query => {
      const url = `https://nominatim.openstreetmap.org/search/${query}?format=json`;
      const response = await fetch(url);
      locations = await response.json();
      render()
    }, 250);

    const updateLocationQuery = async (value) => {
      locationQuery = value;
      render()
      await geocode(value);
    };
    render()

    if (lat && lon) {
      const url = `https://forecast.weather.gov/MapClick.php?lat=${lat}4&lon=${lon}&FcstType=digitalDWML`;
      const response = await fetch(url);
      const text = await response.text();
      const result = await xml2js.parseStringPromise(text);
      data = result.dwml.data[0];
      console.log(data);

      buildWindChart(data);
      buildTemperatureChart(data);
      buildCloudsAndPrecipitationChart(data);
    }
  } catch (e) {
    console.error(e)
  }
})();
