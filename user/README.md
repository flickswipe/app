# USER

Manage user settings and relationships; generate/process media survey queues.

### Overview

This microservice has four main modules:

#### 1. Track INGEST

Processes `MediaItemUpdated`, `MediaItemDestroyed`, and `GenreDetected` events
and stores relevant data.

#### 2. Track AUTH

Processes `UserCreated` and `UserUpdatedEmail` events and stores relevant data.

#### 3. Relationships

Manages user relationships

#### 4. Settings

Manages user settings.

### API Documentation

Run `npm run apidoc` to generate documentation, then open it:

```shell
start ./apidoc/index.html
```

---

# Track INGEST

Tracks a subset of data from `MediaItemUpdated`, `MediaItemDestroyed`,
and`GenreDetected` events.

## MongoDB schema

| Genre (Follows INGEST) |          |
| ---------------------- | -------- |
| name                   | `string` |
| language               | `string` |

| MediaItem (Follows INGEST) |                                  |
| -------------------------- | -------------------------------- |
| genres                     | `Array<Genre._id>`               |
| rating                     | `{ average, count, popularity }` |
| language                   | `string`                         |
| releaseDate                | `Date`                           |
| runtime                    | `number`                         |
| streamLocations            | `Array<Locations._.id>`          |
| createdAt                  | `Date`                           |
| updatedAt                  | `Date`                           |

| Location (Follows INGEST) |          |
| ------------------------- | -------- |
| name                      | `string` |
| displayName               | `string` |
| id                        | `string` |
| url                       | `string` |

| Language (Follows INGEST) |          |
| ------------------------- | -------- |
| code                      | `string` |
| name                      | `string` |

---

# Track AUTH

Tracks a subset of data from `UserCreated` and `UserUpdatedEmail` events.

## MongoDB schema

| User (Follows AUTH) |          |
| ------------------- | -------- |
| email               | `string` |

# Relationships

Creates and updates relationships between users.

### Requesting friendship

An authenticated user can send a “friend request” to another user by entering
that user’s email.

### Accepting, rejecting, and blocking requests

An authenticated user can see their pending “friend requests” and choose to
either accept or reject them. If they choose to reject, a second option to
additionally block future requests is given.

### Viewing friendships and unblocking requests

A user can view their relationships and a list of blocked users in a “friends”
tab. They can also unblock users.

## MongoDB schema

| Relationship (Primary) |                                    |
| ---------------------- | ---------------------------------- |
| \_id                   |                                    |
| relationshipType       | `"pending", "accepted", "blocked"` |
| sourceUserId           |                                    |
| targetUserId           |                                    |
| createdAt              | `Date`                             |
| updatedAt              | `Date`                             |

## MongoDB flows

1. When a user sends an invite to someone who has not blocked them, two
   documents are created:

   | \_id | relationshipType | sourceUserId | targetUserId | …   |
   | ---- | ---------------- | ------------ | ------------ | --- |
   |      | accepted         | User(A).\_id | User(B).\_id |     |
   |      | pending          | User(B).\_id | User(A).\_id |     |

2. When a user rejects a user, both documents are deleted. This handles both
   pending and accepted relationships.

3. When a user blocks someone, any previous accepted/pending documents between
   them are deleted and one document is created:

   | \_id | relationshipType | sourceUserId | targetUserId | …   |
   | ---- | ---------------- | ------------ | ------------ | --- |
   |      | blocked          | User(A).\_id | User(B).\_id |     |

Events

| Event                 | Payload                                              |
| --------------------- | ---------------------------------------------------- |
| relationshipCreated   | { id, relationshipType, sourceUserId, targetUserId } |
| relationshipUpdated   | { id, relationshipType, sourceUserId, targetUserId } |
| relationshipDestroyed | { id }                                               |

# Settings

Manages user settings, including:

Filters:

- Min/max rating
- Min/max release date
- Min/max runtime
- Whitelist genres
- Blacklist genres
- Show/hide stream providers
- Whitelist languages
