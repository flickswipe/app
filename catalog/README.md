# CATALOG

Provides endpoints for aggregated media item data.

### Overview

Listens for events from the `INGEST` microservice and stores the data. Provides
a set of routes for the app to access media item data.

## MongoDB Schema

| TmdbGenre (Follows INGEST) |          |
| -------------------------- | -------- |
| tmdbGenreId                | `string` |
| name                       | `string` |
| language                   | `string` |

| TmdbMovie (Follows INGEST) |                                  |
| -------------------------- | -------------------------------- |
| tmdbMovieId                | `string`                         |
| imdbId                     | `string`                         |
| title                      | `string`                         |
| genres                     | `Array<TmdbGenre._id>`           |
| images                     | `{ poster, backdrop }`           |
| rating                     | `{ average, count, popularity }` |
| language                   | `string`                         |
| releaseDate                | `Date`                           |
| runtime                    | `number`                         |
| plot                       | `string`                         |
| streamLocations            | `number`                         |
| createdAt                  | `Date`                           |
| updatedAt                  | `Date`                           |
