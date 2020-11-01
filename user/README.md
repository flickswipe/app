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

| Relationship (Primary) |                       |
| ---------------------- | --------------------- |
| \_id                   |                       |
| relationshipType       | `"active", "blocked"` |
| sourceUser             | `User._id`            |
| targetUser             | `User._id`            |
| createdAt              | `Date`                |
| updatedAt              | `Date`                |

| Requests (Primary) |            |
| ------------------ | ---------- |
| \_id               |            |
| sourceUser         | `User._id` |
| targetUser         | `User._id` |
| complete           | `true`     |
| createdAt          | `Date`     |
| updatedAt          | `Date`     |

## MongoDB flows

- A can send request to B, unless:

  - A has sent a request that B has not accepted or rejected
  - A has sent a "completed" request in the last 24 hours
  - A has blocked B
  - B has blocked A

- After sending a request, the following actions can occur:

  - A can cancel the request
  - B can reject the request
  - B can accept the request

  All 3 actions mark the request as "complete"

- If B accepts the request, two "active" relationships are created

- If A blocks B, the A-B relationship is set to "blocked", any "active" B-A
  relationship is deleted, and any non-"complete" requests are deleted.

## Events

| Event               | Payload                                                         |
| ------------------- | --------------------------------------------------------------- |
| RelationshipUpdated | `{ relationshipUpdateType, sourceUser, targetUser, updatedAt }` |

# Settings

Manages user settings, including:

- Min/max rating
- Min/max release date
- Min/max runtime
- Whitelist genres
- Whitelist languages
- Blacklist stream locations

## MongoDB schema

| Setting (Primary) |                                                                                  |
| ----------------- | -------------------------------------------------------------------------------- |
| \_id              |                                                                                  |
| user              | `User._id`                                                                       |
| settingType       | `"genres", "languages", "rating", "release-date", "runtime", "stream-locations"` |
| setting           | `Object`                                                                         |
| createdAt         | `Date`                                                                           |
| updatedAt         | `Date`                                                                           |

## Events

| Event              | Payload                                           |
| ------------------ | ------------------------------------------------- |
| userSettingUpdated | { id, user, settingType, sourceUser, targetUser } |
