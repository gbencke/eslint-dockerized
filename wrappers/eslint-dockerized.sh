#!/bin/bash

echo "docker run  --rm -v $(pwd):/data dockerized-eslint --format unix -c /config/eslint.config.ts /data/$1 | sed \"s~/data~$(pwd)~\""
eval "docker run  --rm -v $(pwd):/data dockerized-eslint --format unix -c /config/eslint.config.ts /data/$1 | sed \"s~/data~$(pwd)~\""
