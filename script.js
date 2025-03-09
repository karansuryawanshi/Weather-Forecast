const API_KEY = "8dc3b96b73f7524a45c3be1915aa7c5a"; // API key for OpenWeatherMap

// Selecting HTML elements
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const recentCities = document.getElementById("recentCities");
const weatherContainer = document.getElementById("weatherContainer");
const forecastContainer = document.getElementById("forecastContainer");
const errorMessage = document.getElementById("errorMessage");
const recentSearches = document.getElementById("recentSearches");

// Event listeners for user interactions
searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
currentLocationBtn.addEventListener("click", getCurrentLocation);
recentCities.addEventListener("change", () => fetchWeather(recentCities.value));

// Function to fetch weather data for a given city
function fetchWeather(city) {
  if (!city) {
    showError("Please enter a valid city name.");
    return;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => displayWeather(data))
    .catch(() => showError("Failed to fetch weather data."));
}

// Function to display fetched weather data
function displayWeather(data) {
  if (data.cod !== 200) {
    showError(data.message);
    return;
  }
  errorMessage.classList.add("hidden");
  weatherContainer.classList.remove("hidden");
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("weatherDescription").textContent =
    data.weather[0].description;
  document.getElementById(
    "weatherIcon"
  ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  document.getElementById(
    "temperature"
  ).textContent = `Temperature: ${data.main.temp}°C`;
  document.getElementById(
    "humidity"
  ).textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById(
    "windSpeed"
  ).textContent = `Wind Speed: ${data.wind.speed} m/s`;
  updateRecentCities(data.name);
  fetchForecast(data.name);
}

// Function to fetch 5-day weather forecast
function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => displayForecast(data.list))
    .catch(() => showError("Failed to fetch forecast."));
}

// Function to display weather forecast
function displayForecast(list) {
  forecastContainer.classList.remove("hidden");
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  // Loop through the forecast list (every 8th entry represents a new day)
  for (let i = 0; i < list.length; i += 8) {
    const day = list[i];
    forecastDiv.innerHTML += `
      <div class="p-2 bg-blue-200 rounded-md text-center flex flex-col items-center justify-center">
        <p>${new Date(day.dt_txt).toDateString()}</p>
        <img src="https://openweathermap.org/img/wn/${
          day.weather[0].icon
        }.png" />
        <p>${day.main.temp}°C</p>
        <p class="font-semibold">Wind: <span class="font-normal">${
          day.wind.speed
        } m/s</span></p>
        <p class="font-semibold">Humidity: <span class="font-normal">${
          day.main.humidity
        }%</span></p>
      </div>
    `;
  }
}

// Function to store and update recent cities in local storage
function updateRecentCities(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }
  recentCities.innerHTML = cities
    .map((c) => `<option value="${c}">${c}</option>`)
    .join("");
  recentCities.classList.remove("hidden");
  recentSearches.classList.remove("hidden");
}

// Function to fetch weather data based on user's current location
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        )
          .then((response) => response.json())
          .then((data) => displayWeather(data))
          .catch(() => showError("Failed to fetch current location weather."));
      },
      () => showError("Location access denied.")
    );
  } else {
    showError("Geolocation not supported.");
  }
}

// Function to display error messages
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}
