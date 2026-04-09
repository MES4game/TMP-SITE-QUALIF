#!/bin/bash

screen -dmS camisole-vm bash -c '/vm/bootstrap.sh >> /mounted/bootstrap.log 2>&1'

if [ "$#" -eq 0 ]; then
    exec pnpm run start
else
    exec "$@"
fi
