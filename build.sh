#!/usr/bin/env bash
yarn cache clean && \
yarn install && \
yarn --cwd json-form build && \
yarn --cwd sandbox build