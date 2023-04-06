#!/bin/bash
#
# Helps redeploy services when there are git remote changes
#
# @usage: sudo ./check.sh [branch] [--force]
# @example: sudo ./check.sh origin/master --force

FETCH=$(git fetch)
UPSTREAM=${1:-'origin/master'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

function rebuild() {
    git pull
    docker-compose up --build -d
}

if [ "$2" = "--force" ]; then
    echo "$(date +%FT%T) --force rebuild"
    rebuild
elif [ $LOCAL = $REMOTE ]; then
    echo "$(date +%FT%T) Up-to-date"
elif [ $LOCAL = $BASE ]; then
    echo "$(date +%FT%T) Need to pull"
    rebuild
elif [ $REMOTE = $BASE ]; then
    echo "$(date +%FT%T) Need to push"
else
    echo "$(date +%FT%T) Diverged"
fi



