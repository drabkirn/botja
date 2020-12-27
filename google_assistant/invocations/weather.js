const fetch = require("node-fetch");
const weatherURL = `https://api.openweathermap.org/data/2.5/forecast`;

module.exports = {
  weatherCommand: weatherCommandFn
};

async function weatherCommandFn(conv, appInsightsClient, promptModule, cityName) {
  let speechText = '';
  
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Weather called", req: "correct", args: cityName }});
  
  let myHeaders = {
    'Content-Type': 'application/json'
  };
  
  await fetch(`${weatherURL}?q=${cityName}&APPID=${process.env.OPEN_WEATHER_MAP_API}&units=metric`, { method: 'GET', headers: myHeaders })
    .then((response) => response.json())
    .then((body) => {
      if(body.cod == "200"){
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
        
        speechText = `Here's your weather of ${apiCityName}, ${apiCountry} with population ${apiPopulation}. You can expect ${weatherDescription}. Temperature is ${temperature} degree celsius. Cloudiness is ${cloudiness}%. Atmospheric Pressure is ${atmPressure} hPa. Humidity is ${humidity}%. Wind Speed is ${windSpeed} m/s. Wind Direction is aroung ${windDirection} degrees. Information was last updated at ${apiInfoUpdated}. Bye Bye.`;
      }
      else{
        appInsightsClient.trackTrace({
          message: "Other Error",
          severity: 3,
          properties: { name: "botja-google-actions", invocation: "Weather",  warn: { message: "city not found/invalid", cityName: cityName } }
        });
        
        speechText = `I couldn't find this city, or maybe I'm yet to look for ${ cityName } in the map. You can try again with another city name. I'm closing for now, see you soon.`;
      }

      promptModule.promptCommand(conv, speechText, [], [], []);
    })
    .catch((err) => {
      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-google-actions", invocation: "Weather", err: err }
      });
      
      speechText = `There was some problem connecting to Cool Crave's Engine, please try after sometime. If the problem persists, please ping me at drabkirn@cdadityang.xyz. I'm closing for now, see you soon.`;

      promptModule.promptCommand(conv, speechText, [], [], []);
    });
};