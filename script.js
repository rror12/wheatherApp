// weather app logic - openweather integration
const key = '40fd7825a721ebc65ddb7a6517eaeeff';
const api_url = 'https://api.openweathermap.org/data/2.5/weather';

// get all the elements we need
const searchInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locBtn = document.getElementById('location-btn');
const weatherBox = document.getElementById('weather-info');
const welcome = document.getElementById('welcome-message');
const loader = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// main function to get weather by city name
async function getWeatherData(city) {
    // show loading state
    loader.style.display = 'block';
    weatherBox.classList.remove('active');
    errorDiv.style.display = 'none';
    welcome.style.display = 'none';

    try {
        const res = await fetch(`${api_url}?q=${city}&units=metric&appid=${key}`);
        const data = await res.json();
        
        if (data.cod == '404') {
            loader.style.display = 'none';
            errorDiv.textContent = "Oops! Couldn't find that city. Try again?";
            errorDiv.style.display = 'block';
            welcome.style.display = 'block';
            return;
        }
        
        if (!res.ok) throw new Error('api error');

        displayWeather(data);
    } catch (err) {
        console.log(err);
        loader.style.display = 'none';
        errorDiv.textContent = "Something went wrong. Check your connection.";
        errorDiv.style.display = 'block';
    }
}

// helper to update the UI
function displayWeather(data) {
    document.getElementById('city-name').textContent = data.name + ', ' + data.sys.country;
    
    // format date nicely
    const d = new Date();
    const dateString = d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    document.getElementById('date').textContent = dateString;
    
    document.getElementById('temp').textContent = Math.round(data.main.temp) + '°C';
    document.getElementById('description').textContent = data.weather[0].description;
    
    const icon = data.weather[0].icon;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
    
    document.getElementById('feels-like').textContent = Math.round(data.main.feels_like) + '°C';
    document.getElementById('humidity').textContent = data.main.humidity + '%';
    document.getElementById('wind-speed').textContent = (data.wind.speed * 3.6).toFixed(1) + ' km/h';
    document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
    
    loader.style.display = 'none';
    welcome.style.display = 'none';
    weatherBox.classList.add('active');
}

// event listeners
searchBtn.addEventListener('click', function() {
    let city = searchInput.value.trim();
    if (city) getWeatherData(city);
});

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        let city = searchInput.value.trim();
        if (city) getWeatherData(city);
    }
});

locBtn.addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            loader.style.display = 'block';
            
            try {
                const res = await fetch(`${api_url}?lat=${latitude}&lon=${longitude}&units=metric&appid=${key}`);
                const data = await res.json();
                displayWeather(data);
            } catch (err) {
                loader.style.display = 'none';
                errorDiv.textContent = "Couldn't get your location weather.";
                errorDiv.style.display = 'block';
            }
        }, () => {
            alert("Location access denied.");
        });
    }
});
