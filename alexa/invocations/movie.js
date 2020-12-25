const fetch = require("node-fetch");
const moviedbDiscoverMovieURL = `https://api.themoviedb.org/3/discover/movie`;

module.exports = {
  movieCommand: movieCommandFn
};

function movieCommandFn(appInsightsClient, action) {
  if(action === "in_progress") {
    return {
      canHandle(handlerInput) {
        const hiRequest = handlerInput.requestEnvelope.request;
        return hiRequest.type === 'IntentRequest'
          && hiRequest.intent.name === 'MovieIntent'
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
          && hiRequest.intent.name === 'MovieIntent'
          && hiRequest.dialogState === 'COMPLETED';
      },
      async handle(handlerInput) {
        const hiRequest = handlerInput.requestEnvelope.request;
        let speechText = '';
        let errorText = 'noerror';
        
        let numberOfMovies = hiRequest.intent.slots.numberOfMoviesSlot.value;
        let genreOfMovies = hiRequest.intent.slots.genreMoviesSlot.value.toLowerCase();
        let yearOfMovies = hiRequest.intent.slots.yearOfMoviesSlot.value;
        
        appInsightsClient.trackEvent({name: "botja-alexa", properties: { desc: "MovieIntent called", req: "correct", args: { numberOfMoviesCalled: numberOfMovies, genreOfMovieCalled: genreOfMovies, yearOfMovieCalled: yearOfMovies } }});
        
        const genres = {
          action: {
            id: 28,
          },
          adventure: {
            id: 12,
          },
          animation: {
            id: 16,
          },
          comedy: {
            id: 35,
          },
          crime: { 
            id: 80,
          },
          documentary: {
            id: 99,
          },
          drama: {
            id: 18,
          },
          family: { 
            id: 10751,
          },
          history: { 
            id: 36,
          },
          horror: {
            id: 27,
          },
          mystery: {
            id: 9648,
          },
          romance: {
            id: 10749,
          },
          triller: { 
            id: 53,
          },
          war: { 
            id: 10752,
          },
          '(quit)': {
            id: 0,
          },
        };
        
        const params = {};
        if(genres[genreOfMovies]) {
          params.with_genres = genres[genreOfMovies].id;
        } else {
          params.with_genres = genres["action"].id;
        }
        params.primary_release_year = yearOfMovies;
    
        const myHeaders = {
          'User-Agent': 'Cool Crave on Alexa | drabkirn@cdadityang.xyz | https://drabkirn.cdadityang.xyz',
          'Content-Type': 'application/json'
        };
    
        await fetch(`${moviedbDiscoverMovieURL}?api_key=${process.env.TMDB_MOVIE_API_V3}&primary_release_year=${params.primary_release_year}&with_genres=${params.with_genres}`, { method: 'GET', headers: myHeaders })
          .then((res) => res.json())
          .then((body) => {
            const movies = body.results;
            let number = numberOfMovies;
            let startIndex = 0;
            const maxMoviesToShow = 5;
            let requestedNumber;
    
            if (number > maxMoviesToShow) {
              requestedNumber = number;
              number = maxMoviesToShow;
            } else if (number === 1) {
              /* If the user only requested one movie
                let's randomly choose one */
              startIndex = Math.floor(Math.random() * maxMoviesToShow);
              number = startIndex + 1;
            }
            let moviesArray = [];
            movies.slice(startIndex, number).forEach((movie) => {
              moviesArray.push(movie.title);
            });
            var i = 0;
            let a;
            let b;
            let newArr = [];
            while(i < moviesArray.length){
              a = moviesArray[i];
              b = (i+1) + '. ' + a;
              newArr.push(b);
              i = i + 1;
            }
            let finalArray = newArr.join(', ');
            if(requestedNumber > maxMoviesToShow){
              speechText = `Sorry, I can only show the first ${maxMoviesToShow} movies. According to your requirements, Here are the titles of movies you should watch: ${finalArray}`;
            }
            else{
              speechText = `Sure, According to your requirements I've found ${number} titles of movies you should watch: ${finalArray}`;
            }
          })
          .catch((err) => {
            appInsightsClient.trackTrace({
              message: "Network Error",
              severity: 3,
              properties: { name: "botja-alexa", invocation: "MovieIntent", err: err }
            });
            
            errorText = 'Oops, Maybe there was some error, can you please try again? If the problem persists please message the admin at drabkirn@cdadityang.xyz';
          });
          
        if(errorText == 'noerror'){
          return handlerInput.responseBuilder
              .speak(speechText)
              .reprompt(speechText)
              .withSimpleCard('Movies', speechText)
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