# Set up guide

## Pre-requisites

- [Docker](https://www.docker.com/)
- [Kubernetes](https://kubernetes.io/)
- [Skaffold](https://skaffold.dev/docs/install/)

## Initial set up

1. Add ingress to kubernetes via [the installation guide](https://kubernetes.github.io/ingress-nginx/deploy/) or helm:

```shell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install my-release ingress-nginx/ingress-nginx
```

2. Create test secrets:

```shell
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=test_key
kubectl create secret generic rapidapi-secret --from-literal=RAPIDAPI_KEY=test_key
kubectl create secret generic tmdb-secret --from-literal=TMDB_KEY=test_key
```

3. Add a line to your HOSTS file:

```text
127.0.0.1 flickswipe.dev
```

## Start Development Environment

1. Start all services and watch for changes:

```shell
skaffold dev
```

2. Port forward ingress to `localhost:80`:

```shell
kubectl port-forward service/ingress-nginx-controller 80:80
```

Alternatively, port forward individual services like this, and test in postman:

```shell
kubectl port-forward service/auth-srv 3000:3000
```

## End Development Environment

Stop all services:

```shell
skaffold delete
```
