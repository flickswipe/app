# Survey

Provides media item data to user and consumes user ratings.

### Overview

Listens for events from the `INGEST` microservice and stores the data. Provides
a set of routes for the app to access media item data.

### Setup

Optionally uses the `survey-db-user` and `survey-db-pass` secrets to override `db-pass` and `db-user`

```
kubectl create secret generic survey-db-user --from-literal=JWT_KEY=???
kubectl create secret generic survey-db-pass --from-literal=JWT_KEY=???
```

### API Documentation

Run `npm run apidoc` to generate documentation, then open it:

```shell
start ./apidoc/index.html
```

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
| genres                     | `Array<Genre._id>`               |
| images                     | `{ poster, backdrop }`           |
| rating                     | `{ average, count, popularity }` |
| language                   | `string`                         |
| releaseDate                | `Date`                           |
| runtime                    | `number`                         |
| plot                       | `string`                         |
| streamLocations            | `number`                         |
| createdAt                  | `Date`                           |
| updatedAt                  | `Date`                           |

| Suggestion |                 |
| ---------- | --------------- |
| id         |                 |
| user       | `User._id`      |
| mediaItem  | `MediaItem._id` |
| createdAt  | `Date`          |
| updatedAt  | `Date`          |

| SurveyResponse |                                                     |
| -------------- | --------------------------------------------------- |
| id             |                                                     |
| user           | `User._id`                                          |
| mediaItem      | `MediaItem._id`                                     |
| interest       | `"interested", "uninterested", "consumed", "never"` |
| rating         | `number`                                            |
| createdAt      | `Date`                                              |
| updatedAt      | `Date`                                              |
