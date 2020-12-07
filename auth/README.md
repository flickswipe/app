# AUTH

Handles user authentication.

### Set up

Requires the `jwt-secret` secret, which can be any string of (secret) random characters.

```
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=???
```

Optionally uses the `auth-db-user` and `auth-db-pass` secrets to override `db-pass` and `db-user`

```
kubectl create secret generic auth-db-user --from-literal=JWT_KEY=???
kubectl create secret generic auth-db-pass --from-literal=JWT_KEY=???
```

### API Documentation

Run `npm run apidoc` to generate documentation, then open it:

```shell
start ./apidoc/index.html
```

### Signing up

Guest users (ie. users without a confirmed email) are created as soon as an unauthenticated user visits the app. After a small number of interactions, the guest user is invited to enter their email. After clicking a link in a confirmation email, the user is upgraded. Users may change the email address associated with their account at any time.

### Signing in

An unauthenticated user can sign in by entering their email. A “magic link” is then sent to their address. After clicking the link, the user is issued a JWT cookie which will authenticate future requests.

Users must access the magic link with same browser/connection with which it was requested.

Users do not have to sign in again unless they sign out.

### Signing out

An authenticated user can sign out. A cookie remains on their device to prevent a guest user being created on their next visit.

## MongoDB Schema

| User (Primary) |                  |
| -------------- | ---------------- |
| email          | `string`, `null` |
| createdAt      | `Date`           |
| updatedAt      | `Date`           |

| EmailToken (Primary) |                      |
| -------------------- | -------------------- |
| emailTokenType       | `SignIn`, `AddEmail` |
| user                 | `User._id`           |
| userAgent            | `string`             |
| token                | `string`             |
| url                  | `string`             |
| payload              | `json`               |
| expiresAt            | `Date`               |
| createdAt            | `Date`               |
| updatedAt            | `Date`               |

## Events

### Publishes

| Event             | Payload                                                |
| ----------------- | ------------------------------------------------------ |
| UserCreated       | `{ id, email, createdAt }`                             |
| UserUpdatedEmail  | `{ id, email, updatedAt }`                             |
| EmailTokenCreated | `{ id, emailTokenType, email, url, token, expiresAt }` |
