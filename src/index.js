import join from 'lodash/join';

function component() {
    var element = document.createElement('div');
    element.innerHTML = join(['webpack', 'loaded'], ' ');
    return element;
}

document.body.appendChild(component());

var httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      var element = document.createElement('div');
      element.innerHTML = "http request succeeded"
      document.body.appendChild(element);
    } else {
      var element = document.createElement('div');
      element.innerHTML = this.readyState;
      document.body.appendChild(element);
    }
};
httpRequest.open("GET", "https://forecast.weather.gov/MapClick.php?lat=42.3944&lon=-71.1165&FcstType=digitalDWML", true);
httpRequest.send();