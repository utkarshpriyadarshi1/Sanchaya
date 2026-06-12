#!/usr/bin/env bash
# Delegate execution to builder/clean.sh
exec "$(dirname "$0")/builder/clean.sh" "$@"
