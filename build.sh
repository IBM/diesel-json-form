#!/usr/bin/env bash
yarn install && \
yarn --cwd json-form build && \
yarn --cwd sandbox build