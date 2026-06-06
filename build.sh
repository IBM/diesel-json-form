#!/usr/bin/env bash
npm install && \
(cd json-form && npm run build) && \
(cd sandbox2 && npm run build)