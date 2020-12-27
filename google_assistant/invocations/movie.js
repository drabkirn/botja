const fetch = require("node-fetch");
const moviedbDiscoverMovieURL = `https://api.themoviedb.org/3/discover/movie`;
const imagesBaseUrl = 'https://image.tmdb.org/t/p/';
const posterSize = 'w500';

module.exports = {
  movieCommand: movieCommandFn
};

async function movieCommandFn(conv, appInsightsClient, promptModule, numberOfMovies, genreOfMovies, yearOfMovies) {
  let speechText = '';
  
  appInsightsClient.trackEvent({name: "botja-google-actions", properties: { desc: "Movie called", req: "correct", args: { numberOfMoviesCalled: numberOfMovies, genreOfMovieCalled: genreOfMovies, yearOfMovieCalled: yearOfMovies } }});
  
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
    'User-Agent': 'Cool Crave on Google Assistant | drabkirn@cdadityang.xyz | https://drabkirn.cdadityang.xyz',
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
      let moviesItems = [];
      movies.slice(startIndex, number).forEach((movie) => {
        moviesArray.push(movie.title);

        moviesItems.push({
          title: movie.title,
          description: movie.overview,
          image: {
            url: `${imagesBaseUrl}${posterSize}${movie.poster_path}`,
            alt: movie.title
          },
          openUriAction: {
            url: `https://www.themoviedb.org/movie/${movie.id}`
          }
        });
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

      const movieCollection = [{
        imageFill: "WHITE",
        items: moviesItems
      }];
      promptModule.promptCommand(conv, speechText, [], [], movieCollection);
    })
    .catch((err) => {
      appInsightsClient.trackTrace({
        message: "Network Error",
        severity: 3,
        properties: { name: "botja-google-actions", invocation: "Movie", err: err }
      });
      
      speechText = `There was some problem connecting to Cool Crave's Engine, please try after sometime. If the problem persists, please ping me at drabkirn@cdadityang.xyz. I'm closing for now, see you soon.`;

      promptModule.promptCommand(conv, speechText, [], [], []);
    });
};