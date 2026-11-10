const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const weatherInfo = document.getElementById("weatherInfo");
const message = document.getElementById("message");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name!";
        weatherInfo.classList.add("hide");
        return;
    }

    message.textContent = "Loading weather...";
    weatherInfo.classList.add("hide");

    try {

        // Get city coordinates
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!locationResponse.ok) {
            throw new Error("Unable to find location.");
        }

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found!");
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Get weather information
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to fetch weather.");
        }

        const weatherData = await weatherResponse.json();

        displayWeather(location, weatherData.current);

    } catch (error) {

        message.textContent = error.message;
        weatherInfo.classList.add("hide");

    }
}

function displayWeather(location, weather) {

    document.getElementById("cityName").textContent =
        location.name + ", " + location.country;

    document.getElementById("temperature").textContent =
        weather.temperature_2m + "°C";

    document.getElementById("humidity").textContent =
        weather.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
        weather.wind_speed_10m + " km/h";

    const weatherDetails = getWeatherDescription(weather.weather_code);

    document.getElementById("description").textContent =
        weatherDetails.description;

    document.getElementById("weatherIcon").textContent =
        weather.is_day ? weatherDetails.dayIcon : weatherDetails.nightIcon;

    message.textContent = "";
    weatherInfo.classList.remove("hide");
}

function getWeatherDescription(code) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            dayIcon: "☀️",
            nightIcon: "🌙"
        };
    }

    if ([1, 2, 3].includes(code)) {
        return {
            description: "Partly Cloudy",
            dayIcon: "⛅",
            nightIcon: "☁️"
        };
    }

    if ([45, 48].includes(code)) {
        return {
            description: "Foggy",
            dayIcon: "🌫️",
            nightIcon: "🌫️"
        };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return {
            description: "Drizzle",
            dayIcon: "🌦️",
            nightIcon: "🌧️"
        };
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return {
            description: "Rainy",
            dayIcon: "🌧️",
            nightIcon: "🌧️"
        };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return {
            description: "Snowy",
            dayIcon: "❄️",
            nightIcon: "❄️"
        };
    }

    if ([95, 96, 99].includes(code)) {
        return {
            description: "Thunderstorm",
            dayIcon: "⛈️",
            nightIcon: "⛈️"
        };
    }

    return {
        description: "Unknown Weather",
        dayIcon: "🌤️",
        nightIcon: "🌙"
    };
}