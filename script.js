// 'https://api.open-meteo.com/v1/forecast?latitude=50.4422&longitude=30.5367&hourly=temperature_2m,precipitation,rain,showers,snowfall,snow_depth,windspeed_10m'
const cities = {'Kyiv':[50.4422, 30.5367],
                'Madrid':[40.4167, -3.7033],
                'Warsaw':[52.2297, 21.0122],
                'New York':[40.71, -74.01],
                'Los Angeles':[34.05, -118.24],
                'Tokyo':[35.6785, 139.6823],
                'Malaga':[36.7182, -4.4842],
                'Uzhhorod':[48.6215, 22.2567],
                'London':[51.5002, -0.1262]
            };
                
const properties = `temperature_2m,precipitation,windspeed_10m,rain,showers,snowfall,cloudcover`;

//const latlong = `latitude=50.4422&longitude=30.5367`;

const temperatureField = document.querySelector('#temperature');
const precipitationField = document.querySelector('#precipitation');
const windspeedField = document.querySelector('#windspeed');
const geolocationCheckbox = document.getElementById("weather-position");
let isGeoLocation = false;
const dateField = document.querySelector('#date-setting');
const weatherDate = document.querySelector('#input-date');
const citySelected = document.querySelector('#city');
const imageContentField = document.querySelector('.content-info');
const settingsEvent = document.querySelector('#settings');
let latitude;
let longitude;
const cityField = document.querySelector('.city');

settingsEvent.addEventListener('click', () => showWeather());

window.onload = (event) => {
    let currentDate = new Date().toJSON().slice(0,10);
    document.querySelector("#input-date").value = currentDate;
};

geolocationCheckbox.addEventListener('change', (e) => {
    isGeoLocation = e.target.checked;
})

function getWeatherProperties(){
    let weatherProperties = [];
    try{
        return fetch(`https://api.open-meteo.com/v1/forecast?${getCoordinate()}&hourly=${properties}&start_date=${weatherDate.value}&end_date=${weatherDate.value}`)
        .then(response => response.json())
        .then(data => {weatherProperties = data;
            return weatherProperties})
    } catch(error){
        console.log(error);
    }
    return weatherProperties;
}

function showWeather(){
    getWeatherProperties().then((data) => {
        changeDOMText(data['hourly']);
        changeDOMImage(data['hourly']);
    });    
};

function getCoordinate(){
    if(isGeoLocation){
        return `latitude=${latitude}&longitude=${longitude}`;
    }
    return `latitude=${cities[citySelected.value][0]}&longitude=${cities[citySelected.value][1]}`;
}

function changeDOMText(weatherProperties){
    let temperature = weatherProperties['temperature_2m'].sort((a, b) => a - b);
    let precipitation = Math.floor(weatherProperties['precipitation'].reduce((prValue, curValue) => prValue + curValue));
    let windspeed_10m = weatherProperties['windspeed_10m'].sort((a, b) => a - b);
    if(Math.floor(temperature[0]) == Math.floor(temperature[23])){
        temperatureField.innerHTML = `${Math.floor(temperature[0])}&#8451`;
    } else {
        temperatureField.innerHTML = `min ${Math.floor(temperature[0])}&#8451 max ${Math.floor(temperature[23])}&#8451`;
    }
    if(windspeed_10m[0] == windspeed_10m[23]){
        windspeedField.innerHTML = `${windspeed_10m[0]}km/h`;
    } else {
        windspeedField.innerHTML = `${windspeed_10m[0]}-${windspeed_10m[23]}km/h`;
    }
    precipitationField.innerHTML = `${precipitation}mm`
    dateField.innerHTML = weatherDate.value;
}

function changeDOMImage(weatherProperties){
    // rain,showers,snowfall,cloudcover
    let cloudcover = weatherProperties['cloudcover'].reduce((prValue, curValue) => prValue + curValue)/24;
    let rain = weatherProperties['rain'].reduce((prValue, curValue) => prValue + curValue);
    let showers = weatherProperties['showers'].reduce((prValue, curValue) => prValue + curValue);
    let snowfall = weatherProperties['snowfall'].reduce((prValue, curValue) => prValue + curValue);
    let precipitation = Math.floor(weatherProperties['precipitation'].reduce((prValue, curValue) => prValue + curValue));

    if(precipitation > 1) {
        if(cloudcover > 50){
            if(snowfall > 1 && rain > 1) {
                imageContentField.style.backgroundImage = 'url(rain-snow.png)';
            } else if (rain > 1 && rain > showers) {
                imageContentField.style.backgroundImage = 'url(rain.png)';
            } else if(snowfall > 1){
                imageContentField.style.backgroundImage = 'url(snow.png)';
            } else if(showers > 1){
                imageContentField.style.backgroundImage = 'url(showers.png)';
            } else {
                imageContentField.style.backgroundImage = 'url(cloud.png)';
            }
        }
        else {
            if(rain > 1 || showers > 1) {
                imageContentField.style.backgroundImage = 'url(rain-sun.png)';
            } else if(snowfall > 1) {
                imageContentField.style.backgroundImage = 'url(snow-sun.png)';
            } else {
                imageContentField.style.backgroundImage = 'url(sun-cloud.png)';
            }
        }
    } else {
        if(cloudcover > 75) {
            imageContentField.style.backgroundImage = 'url(cloud.png)';
        } else if (cloudcover > 25 && cloudcover <= 75) {
            imageContentField.style.backgroundImage = 'url(sun-cloud.png)';
        } else {
            imageContentField.style.backgroundImage = 'url(sun.png)';
        }
    }
}

function changeShowClasses(){
    const cities = document.querySelector('.cities');
    const geoLocation = document.querySelector('.geolocation');
    cities.classList.toggle('cities__not-diplay');
    geoLocation.classList.toggle('geolocation__display');
}

//////////////////////////////////////

function getCity() {
    var xhr = new XMLHttpRequest();
  
    // Paste your LocationIQ token below.
    xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=pk.8f3eadbb8351cdd993a488ab59e5cd35&lat=" +
    latitude + "&lon=" + longitude + "&format=json", true);
    xhr.send();
    xhr.onreadystatechange = processRequest;
    xhr.addEventListener("readystatechange", processRequest, false);
  
    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            var city = response.address.city;
            console.log(city);
            cityField.innerHTML = city;
            return;
        }
    }
}

function showLocation(position){
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    getCity();
}

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showLocation);
    } else {
       alert("Geolocation is not supported by this browser.");
    }
}

function changeSettingForm(){
    changeShowClasses();
    getLocation();  
}