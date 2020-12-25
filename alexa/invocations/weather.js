const fetch = require("node-fetch");
const weatherURL = `https://api.openweathermap.org/data/2.5/forecast`;

module.exports = {
  weatherCommand: weatherCommandFn
};

function weatherCommandFn(appInsightsClient, action) {
  if(action === "in_progress") {
    return {
      canHandle(handlerInput) {
        const hiRequest = handlerInput.requestEnvelope.request;
        return hiRequest.type === 'IntentRequest'
          && hiRequest.intent.name === 'WeatherIntent'
          && hiRequest.dialogState !== 'COMPLETED';
      },
      handle(handlerInput) {
        return handlerInput.responseBuilder
          .addDelegateDirective(handlerInput.requestEnvelope.request.intent)
          .getResponse();
      },
    }
  }
  else if(action === "completed") {
    return {
      canHandle(handlerInput) {
        const hiRequest = handlerInput.requestEnvelope.request;
        return hiRequest.type === 'IntentRequest'
          && hiRequest.intent.name === 'WeatherIntent'
          && hiRequest.dialogState === 'COMPLETED';
      },
      async handle(handlerInput) {
        let speechText = '';
        let errorText = 'noerror';
        let cityName = handlerInput.requestEnvelope.request.intent.slots.cityIntentSlot.value;
        
        appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "WeatherIntent called", req: "correct", args: cityName }});
        
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
              
              speechText = `Here's your weather of ${apiCityName}, ${apiCountry} with population ${apiPopulation}. You can expect ${weatherDescription}. Temperature is ${temperature} degree celsius. Cloudiness is ${cloudiness}%. Atmospheric Pressure is ${atmPressure} hPa. Humidity is ${humidity}%. Wind Speed is ${windSpeed} m/s. Wind Direction is aroung ${windDirection} degrees. Information was last updated at ${apiInfoUpdated}.`;
            }
            else{
              appInsightsClient.trackTrace({
                message: "Other Error",
                severity: 3,
                properties: { name: "botja-alexa", invocation: "WeatherIntent",  warn: { message: "city not found/invalid", cityName: cityName } }
              });
              
              speechText = `You've entered an invalid city. Can you give it an another try?`;
            }
          })
          .catch((err) => {
            appInsightsClient.trackTrace({
              message: "Network Error",
              severity: 3,
              properties: { name: "botja-alexa", invocation: "WeatherIntent", err: err }
            });
            
            errorText = 'Oops, Maybe there was some error, can you please try again? If the problem persists please message the admin at drabkirn@cdadityang.xyz';
          });
          
        if(errorText == 'noerror'){
          return handlerInput.responseBuilder
              .speak(speechText)
              .reprompt(speechText)
              .withSimpleCard('Your Weather', speechText)
              .getResponse();
        } else{
          return handlerInput.responseBuilder
              .speak(errorText)
              .reprompt(errorText)
              .withSimpleCard('API Error', errorText)
              .getResponse();
        }
      },
    }
  }
};