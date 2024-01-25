const apiKey = "2d0cd7d4f1d9434a9b6183313240601";
const baseUrl = "https://api.weatherapi.com/v1/forecast.json";
const cardsContainer = document.querySelector(".forecast-cards");
const search = document.getElementById("searchBox");
const locationElement = document.querySelector("p.location");
const allBars = document.querySelectorAll(".clock");
const cityImg = document.querySelector(".city-items");
let currentLocation = "cairo";
let recentCities = JSON.parse(localStorage.getItem("cities")) || [];

async function getWeather(city) {
  const response = await fetch(`${baseUrl}?key=${apiKey}&days=7&q=${city}`);
  if (response.status != 200 && search.value != "") {
    search.value = "";
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please Enter Valid City !",
    });
    return;
  }
  const data = await response.json();
  dispalyWeather(data);
  search.value = "";
}

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const currentLocation = `${latitude},${longitude}`;
  getWeather(currentLocation);
}

function dispalyWeather(data) {
  locationElement.innerHTML = `<span class="city-name">${data.location.name}</span>, ${data.location.country}`;
  const days = data.forecast.forecastday;
  const now = new Date();
  let cards = "";
  for (let [index, day] of days.entries()) {
    const date = new Date(day.date);
    const weekday = date.toLocaleDateString("en-us", { weekday: "long" });
    cards += `<div class="${
      index == 0 ? "card active" : "card"
    }" data-index=${index} >
      <div class="card-header">
        <div class="day">${weekday}</div>
        <div class="time">${
          now.getHours() > 12 ? now.getHours() - 12 : now.getHours()
        }:${now.getMinutes()} ${now.getHours() > 11 ? "PM" : "AM"}</div>
      </div>
      <div class="card-body">
        <img src="./images/conditions/${day.day.condition.text}.svg"/>
        <div class="degree">${day.hour[now.getHours()].temp_c}°C</div>
      </div>
      <div class="card-data">
        <ul class="left-column">
          <li>Real Feel: <span class="real-feel">${
            day.hour[now.getHours()].feelslike_c
          }°C</span></li>
          <li>Wind: <span class="wind">${
            day.hour[now.getHours()].wind_kph
          } K/h</span></li>
          <li>Pressure: <span class="pressure">${
            day.hour[now.getHours()].pressure_mb
          }Mb</span></li>
          <li>Humidity: <span class="humidity">${
            day.hour[now.getHours()].humidity
          }%</span></li>
        </ul>
        <ul class="right-column">
          <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
          <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
        </ul>
      </div>
    </div>`;
  }
  cardsContainer.innerHTML = cards;
  const allCards = document.querySelectorAll(".card");
  for (let card of allCards) {
    card.addEventListener("click", function (e) {
      const activeCard = document.querySelector(".card.active");
      activeCard.classList.remove("active");
      e.currentTarget.classList.add("active");
      displayRain(days[e.currentTarget.dataset.index]);
    });
  }

  let exist = recentCities.find(function (currentCity) {
    return currentCity.city == data.location.name;
  });
  if (exist) return;

  recentCities.push({
    city: data.location.name,
    country: data.location.country,
  });
  localStorage.setItem("cities", JSON.stringify(recentCities));
  dispalyCity(data.location.name, data.location.country);
}

function displayRain(rain) {
  for (let element of allBars) {
    const clock = element.dataset.clock;
    const height = rain.hour[clock].chance_of_rain;
    element.querySelector(".percent").style.height = `${height}%`;
  }
}

async function getCityImage(city) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`
  );
  const data = await response.json();
  return data.results;
}

async function dispalyCity(city, country) {
  let imgArr = await getCityImage(city);
  if (imgArr.length != 0) {
    const random = Math.trunc(Math.random() * imgArr.length);
    let imgSrc = imgArr[random].urls.regular;
    let itemContent = `
  <div class="item">
    <div class="city-image">
      <img src="${imgSrc}" alt="Image for ${city} city" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
  </div>`;
    cityImg.innerHTML += itemContent;
  }
}

window.addEventListener("load", () => {
  navigator.geolocation.getCurrentPosition(success);
  for (let i = 0; i < recentCities.length; i++) {
    dispalyCity(recentCities[i].city, recentCities[i].country);
  }
});

search.addEventListener("blur", function () {
  getWeather(this.value);
});

document.addEventListener("keyup", function (e) {
  if (e.key == "Enter") {
    getWeather(search.value);
  }
});
