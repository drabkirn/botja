const fetch = require("node-fetch");
const { Card } = require('dialogflow-fulfillment');
const moviedbDiscoverMovieBaseURL = 'https://api.themoviedb.org/3/discover/movie';

module.exports = {
  movieCommand: movieCommandFn
};

// Movie Command
async function movieCommandFn(agent, appInsightsClient) {
  let numberOfMovies;
  if(!isNaN(parseInt(agent.parameters.numberOfMovies))) numberOfMovies = agent.parameters.numberOfMovies;
  else numberOfMovies = 1;
  
  let genreOfMovie;
  if(isNaN(parseInt(agent.parameters.genreString))) genreOfMovie = agent.parameters.genreString;
  else genreOfMovie = "action";
  
  let yearOfMovie;
  if(!isNaN(parseInt(agent.parameters.yearOfMovie))) yearOfMovie = agent.parameters.yearOfMovie;
  else yearOfMovie = 2017;

  appInsightsClient.trackEvent({name: "botja-dialogflow", properties: { desc: "Movie called", req: "correct", args: { numberOfMoviesCalled: numberOfMovies, genreOfMovieCalled: genreOfMovie, yearOfMovieCalled: yearOfMovie } }});

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

  const getMovie = async () => {
    const params = {};
    
    // Genre's is causing app to shutdown so strict:
    if(genres[genreOfMovie]) params.with_genres = genres[genreOfMovie].id;
    else params.with_genres = genres["action"].id;
    
    params.primary_release_year = yearOfMovie;

    const myHeaders = {
      'User-Agent': 'Drabkirn Botja - DialogFlow - (https://drabkirn.cdadityang.xyz) - drabkirn@cdadityang.xyz',
      'Content-Type': 'application/json'
    };

    await fetch(`${moviedbDiscoverMovieBaseURL}?api_key=${process.env.TMDB_MOVIE_API_V3}&primary_release_year=${params.primary_release_year}&with_genres=${params.with_genres}`, { method: 'GET', headers: myHeaders })
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
            agent.add(
              `This was fast and I've found you a movie!`
            )

            agent.add(new Card({
              title: movie.title,
              text: movie.overview,
              imageUrl: `https://image.tmdb.org/t/p/w185/${ movie.poster_path }`,
              buttonText: "More Information",
              buttonUrl: `https://www.themoviedb.org/movie/${ movie.id }`
            }));
          });
        }
        else{ 
          let finalNumberOfMovies = numberOfMovies;
          if(numberOfMovies > maxMoviesToShow) {
            agent.add(
              `Sorry, I can only show the first ${ maxMoviesToShow } movies.`
            );

            finalNumberOfMovies = maxMoviesToShow;
          }

          movies.slice(startIndex, finalNumberOfMovies).forEach((movie) => {
            agent.add(new Card({
              title: movie.title,
              text: movie.overview,
              imageUrl: `https://image.tmdb.org/t/p/w185/${ movie.poster_path }`,
              buttonText: "More Information",
              buttonUrl: `https://www.themoviedb.org/movie/${ movie.id }`
            }));
          });
        }
      })
      .catch((err) => {
        agent.add("Exception: Sorry, there's something wrong from our end, If the problem persists, please contact us at drabkirn@cdadityang.xyz");

        appInsightsClient.trackTrace({
          message: "Network Error",
          severity: 3,
          properties: { name: "botja-dialogflow", invocation: "Movie", err: err }
        });
      });
  };

  await getMovie();
};