const fetch = require("node-fetch");

module.exports = {
  weatherCommand: weatherCommandFn
};

// Weather Command
async function weatherCommandFn(agent, appInsightsClient) {
  let cityName;
  if(isNaN(Number(agent.parameters.cityName))) {
    cityName = agent.parameters.cityName;
  }
  else {
    cityName = "Hyderabad";
    agent.add("There was some error in your provided City Name. Defaulting the city name to **Hyderabad**!");

    appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Weather called", req: "wrong", args: agent.parameters }});
  }

  await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&APPID=${process.env.OPEN_WEATHER_MAP_API}&units=metric`)
    .then((res) => res.json())
    .then((body) => {
      if(body.cod == "200") {
        let weatherMain = body.list[0].weather[0].main;
        let weatherDescription = body.list[0].weather[0].description;
        
        let temperature = body.list[0].main.temp;
        let atmPressure = body.list[0].main.pressure;
        let humidity = body.list[0].main.humidity;
        
        let cloudiness = body.list[0].clouds.all;
        
        let windSpeed = body.list[0].wind.speed;
        let windDirection = body.list[0].wind.deg;
        
        let apiCityName = body.city.name;
        let apiCountry = body.city.country;
        let apiPopulation = body.city.population;
        
        let apiInfoUpdated = body.list[0].dt_txt;
        
        agent.add(
          "Here's your weather of **" + apiCityName + ", " + apiCountry + "** | **Population:**  " + apiPopulation + "\n" +
          
          "**Description:**  " + weatherMain + " | " + weatherDescription + "\n" +
          
          "**Cloudiness:**  " + cloudiness + " %\n" +
          
          "**Temperature:**  " + temperature + " deg celsius\n" +
          
          "**Atmospheric Pressure:**  " + atmPressure + " hPa\n" +
          
          "**Humidity:**  " + humidity + " %\n" +
          
          "**Wind Speed:**  " + windSpeed + " m/s\n" +
          
          "**Wind Direction:**  " + windDirection + " deg\n\n" +
          
          "**Information last updated:**  " + apiInfoUpdated + " IST"
        );

        appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Weather called", req: "correct", args: cityName }});
      }
      else {
        agent.add(`Error: Either the city name is wrong or maybe some other error. If the problem persists, please contact us at drabkirn@cdadityang.xyz. Error message from API:\n${body.cod}`);

        appInsightsClient.trackTrace({
          message: "API Error",
          severity: 3,
          properties: { name: "botja-dialogflow", invocation: "Weather", err: body }
        });
      }
    })
    .catch((err) => {
      agent.add("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-dialogflow", invocation: "Weather", err: err }
      });
    });
};