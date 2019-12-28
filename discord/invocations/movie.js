const fetch = require("node-fetch");
const moviedbDiscoverMovieBaseURL = 'https://api.themoviedb.org/3/discover/movie';

module.exports = {
  movieCommand: movieCommandFn
};

// Movie Command
function movieCommandFn(allArguments, receivedMessage, appInsightsClient) {
  let numberOfMovies;
  if(!isNaN(parseInt(allArguments[0]))) numberOfMovies = allArguments[0];
  else numberOfMovies = 1;
  
  let genreOfMovie;
  if(isNaN(parseInt(allArguments[1]))) genreOfMovie = allArguments[1];
  else genreOfMovie = "action";
  
  let yearOfMovie;
  if(!isNaN(parseInt(allArguments[2]))) yearOfMovie = allArguments[2];
  else yearOfMovie = 2017;

  appInsightsClient.trackEvent({name: "botja-discord", properties: { desc: "$movie called", req: "correct", args: { numberOfMoviesCalled: numberOfMovies, genreOfMovieCalled: genreOfMovie, yearOfMovieCalled: yearOfMovie } }});

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

  const getMovie = () => {
    const params = {};
    
    // Genre's is causing app to shutdown so strict:
    if(genres[genreOfMovie]) params.with_genres = genres[genreOfMovie].id;
    else params.with_genres = genres["action"].id;
    
    params.primary_release_year = yearOfMovie;

    const myHeaders = {
      'User-Agent': 'Drabkirn Botja - Discord - (https://drabkirn.cdadityang.xyz) - drabkirn@cdadityang.xyz',
      'Content-Type': 'application/json'
    };

    fetch(`${moviedbDiscoverMovieBaseURL}?api_key=${process.env.TMDB_MOVIE_API_V3}&primary_release_year=${params.primary_release_year}&with_genres=${params.with_genres}`, { method: 'GET', headers: myHeaders })
      .then((res) => res.json())
      .then((body) => {
        const movies = body.results;
        const maxMoviesToShow = 5;
        let startIndex = 0;

        if(numberOfMovies < 2) {
          /* If the user only requested one movie
            let's randomly choose one */
          startIndex = Math.floor(Math.random() * maxMoviesToShow);
          numberOfMovies = startIndex + 1;
          
          movies.slice(startIndex, numberOfMovies).forEach((movie) => {
            
            receivedMessage.channel.send(
              "I've found a movie according to your requirement. \n" +
              "Title of the movie is: " + movie.title + "\n" +
              "More Information: https://www.themoviedb.org/movie/" + movie.id
            );
          });
        }
        else{ 
          let moviesArray = [];
          if(numberOfMovies > maxMoviesToShow) {
            movies.slice(startIndex, maxMoviesToShow).forEach((movie) => {
              moviesArray.push({ title: movie.title, link: "https://www.themoviedb.org/movie/" + movie.id });
            });
            receivedMessage.channel.send(
              "Sorry, I can only show the first " + maxMoviesToShow + " movies. \n" +
              "According to your requirements, Here are the titles of movies you should watch: \n"
            );
            moviesArray.forEach((movieSlice) => receivedMessage.channel.send(`-----\n-----\nTitle: ${movieSlice.title}\nMore Information: ${movieSlice.link}`));
          }
          else {
            movies.slice(startIndex, numberOfMovies).forEach((movie) => {
              moviesArray.push({ title: movie.title, link: "https://www.themoviedb.org/movie/" + movie.id });
            });
            receivedMessage.channel.send("Sure, According to your requirements I've found " + numberOfMovies + " movies. \n");
            moviesArray.forEach((movieSlice) => receivedMessage.channel.send(`-----\n-----\nTitle: ${movieSlice.title}\nMore Information: ${movieSlice.link}`));
          }
        }
      })
      .catch((err) => {
        receivedMessage.channel.send("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

        appInsightsClient.trackTrace({
          message: "Network Error",
          severity: 3,
          properties: { name: "botja-discord", invocation: "$movie", err: err }
        });
      });
  };
  getMovie();
};