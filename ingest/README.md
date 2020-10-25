# INGEST

Imports data about media items from third-party web services.

### Set up

Requires the `rapidapi-secret` and `tmdb-secret` secrets. Sign up and obtain them from [Rapid Api](https://rapidapi.com/utelly/api/utelly "rapid api") and [TMDB user settings](https://www.themoviedb.org/settings/api).

```
kubectl create secret generic rapidapi-secret --from-literal=RAPIDAPI_KEY=???
kubectl create secret generic tmdb-secret --from-literal=TMDB_KEY=???
```

### Overview

Movie data is imported from [TMDB](https://developers.themoviedb.org/3/getting-started "TMDB") and then combined with availability on streaming services data from [Utelly](https://www.utelly.com/). Movie data is free for non-commercial use, whereas utelly charges 0.01 cents (USD) per request (1000 free requests per month).

This strategy uses the following API endpoints:

| Method | Endpoint                                                       | Purpose                                 | Updated      |
| ------ | -------------------------------------------------------------- | --------------------------------------- | ------------ |
| GET    | http://files.tmdb.org/p/exports/movie_ids_{MM_DD_YYYY}.json.gz | Get all `tmdbMovieIds`                  | Daily        |
| GET    | https://api.themoviedb.org/3/movie/{tmdbMovieIds}              | Get movie data                          | Rarely       |
| GET    | https://developers.themoviedb.org/3/genres/get-movie-list      | Get `id` and `name` for all TMDB genres | Almost never |
| GET    | https://rapidapi.p.rapidapi.com/idlookup                       | Get streaming availability data         | Sometimes    |

### Strategy

There are two data ingestion strategies:

#### First Import

Runs when database has no data.

1. Request and insert all `tmdbMovieIds` from yesterday's TMDB file export
2. Request and insert TMDB genre data. Emit `GenreDetected` event for each genre.
3. Start regular import strategy

#### Regular Import

Runs when there are any number of `tmdbMovieIds` in the database.

1. Insert new `tmdbMovieIds` from TMDB file export at 8am UST each day
2. At intervals, request and insert TMDB data for the next `tmdbMovieId`
3. Inspect TMDB data to decide if the `tmdbMovieId` should be ignored in future (eg. because it is marked as adult). Emit `MovieItemDestroyed` if movie has previously been emitted.
4. At intervals, request and upsert utelly data for the next `tmdbMovieId` that already has TMDB data
5. When utelly data request returns streaming availability data, publish `MovieItemUpdated` event
6. At intervals, request and insert TMDB genre data. Emit `GenreDetected` event for new genres.

The next `tmdbMovieId` is always the one that has been requested the least.

## MongoDB Schema

| MovieId (Primary) |           |
| ----------------- | --------- |
| tmdbMovieId       | `string`  |
| timesUsed         | `number`  |
| neverUse          | `boolean` |

| TmdbGenre (Primary) |          |
| ------------------- | -------- |
| tmdbGenreId         | `string` |
| name                | `string` |
| language            | `string` |

| TmdbMovie (Primary) |                                  |
| ------------------- | -------------------------------- |
| tmdbMovieId         | `string`                         |
| imdbId              | `string`                         |
| title               | `string`                         |
| images              | `{ poster, backdrop }`           |
| genres              | `Array<TmdbGenre._id>`           |
| rating              | `{ average, count, popularity }` |
| language            | `string`                         |
| releaseDate         | `Date`                           |
| runtime             | `number`                         |
| plot                | `string`                         |
| timesUsed           | `number`                         |
| createdAt           | `Date`                           |
| updatedAt           | `Date`                           |

| Utelly (Primary) |                                     |
| ---------------- | ----------------------------------- |
| imdbId           | `string`                            |
| country          | `string`                            |
| locations        | `Array<{displayName,name,id,url }>` |
| createdAt        | `Date`                              |
| updatedAt        | `Date`                              |

## Events

| Event            | Payload                                                                               |
| ---------------- | ------------------------------------------------------------------------------------- |
| MovieItemUpdated | `{ title, images, language, releaseDate, runtime, plot, streamLocations, updatedAt }` |
| GenreDetected    | `{ id, name, detectedAt }`                                                            |
