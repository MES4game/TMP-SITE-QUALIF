#!/bin/bash

screen -dmS camisole-vm bash -c '/vm/bootstrap.sh >> back.log 2>&1'

if [ "$#" -eq 0 ]; then
    pnpm run start >> back.log 2>&1
else
    exec "$@"
fi
