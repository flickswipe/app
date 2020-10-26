# MAIL

Listens to events and sends mail accordingly

### Set up

Requires the `smtp-user` and `smtp-pass` secrets, which can be generated from [ethereal email](https://ethereal.email/create).

```
kubectl create secret generic smtp-user --from-literal=SMTP_USER=alvera.cormier@ethereal.email
kubectl create secret generic smtp-pass --from-literal=SMTP_PASS=pKTZeGPJG5mMuSJWEG
```
