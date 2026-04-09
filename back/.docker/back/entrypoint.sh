#!/bin/bash

screen -dmS camisole-vm bash /vm/bootstrap.sh > /mounted/back.log 2>&1
screen -dmS node-backend pnpm run start > /mounted/back.log 2>&1
exec "$@" > /mounted/back.log 2>&1
