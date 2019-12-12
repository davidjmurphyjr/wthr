import xml2js from 'xml2js';
import Highcharts from 'highcharts';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const cloudsAndPrecipitationChartId = "clouds-and-precipitation-chart";
const temperatureChartId = "temperature-chart";


function addDivToDom(id) {
  const container = document.createElement('div');
  container.setAttribute("id", id);
  document.body.appendChild(container);
}

function buildTemperatureChart(data) {
  let dates = data["time-layout"][0]["start-valid-time"];
  const startDateString = dates[0];
  const start = new Date(startDateString);
  Highcharts.setOptions({time: {useUTC: false}});

  const options = {
    chart: {
      type: 'line'
    },
    title: {
      text: 'Temperature'
    },
    plotOptions: {
      series: {
        pointStart: start.getTime(),
        pointInterval: 60 * 60 * 1000,
        marker: {enabled: false}
      }
    },
    xAxis: {
      type: 'datetime',
      labels: {enabled: false},
      crosshair: {
        width: 1,
        color: 'green'
      },
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

    },
    yAxis: {
      title: {
        text: undefined
      },
    },
    series: [
      {
        name: '"dew point"',
        data: data.parameters[0]["temperature"][0].value.map(e => Number(e)),
        color: '#d32431'
      },
      {
        name: "wind chill",
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

  Highcharts.chart(temperatureChartId, options);
}


function buildCloudsAndPrecipitationChart(data) {
  let dates = data["time-layout"][0]["start-valid-time"];
  const startDateString = dates[0];
  const start = new Date(startDateString);
  Highcharts.setOptions({time: {useUTC: false}});

  const options = {
    chart: {
      type: 'area'
    },
    title: {
      text: 'Clouds and Precipitation'
    },
    plotOptions: {
      series: {
        pointStart: start.getTime(),
        pointInterval: 60 * 60 * 1000,
        marker: {enabled: false}
      }
    },
    xAxis: {
      type: 'datetime',
      labels: {enabled: false},
      crosshair: {
        width: 1,
        color: 'green'
      },
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

    },
    yAxis: {
      title: {
        text: undefined
      },
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

  Highcharts.chart(cloudsAndPrecipitationChartId, options);
}


(async () => {
  try {
    const response = await fetch('https://forecast.weather.gov/MapClick.php?lat=42.3944&lon=-71.1165&FcstType=digitalDWML')
    const text = await response.text();
    const result = await xml2js.parseStringPromise(text);
    const data = result.dwml.data[0];
    console.log(data);
    addDivToDom("temperature-chart");
    buildTemperatureChart(data)
    addDivToDom(cloudsAndPrecipitationChartId);
    buildCloudsAndPrecipitationChart(data);
  } catch (e) {
    console.error(e)
  }
})();
