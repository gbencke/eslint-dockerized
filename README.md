
### In order to build:

```
docker build -t dockerized-eslint .
```

### In order to run

```
docker run -it --rm -v $(pwd):/data dockerized-eslint .
```
docker run -it --rm -v $(pwd):/data dockerized-eslint -c /config/eslint.config.function.ts .

