# Predict

Predicts media items suggestions for users.

# Setup

Optionally uses the `predict-db-user` and `predict-db-pass` secrets to override `db-pass` and `db-user`

```
kubectl create secret generic predict-db-user --from-literal=JWT_KEY=???
kubectl create secret generic predict-db-pass --from-literal=JWT_KEY=???
```
