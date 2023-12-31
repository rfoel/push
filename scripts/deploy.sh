#!/bin/bash

npm install

npm run deploy -w server
npm run build -w app

export $(grep -v '^#' .env | xargs)

aws configure set preview.cloudfront true
aws s3 cp app/dist/ s3://${BUCKET_NAME} --recursive 
aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION} --paths "/*" "/index.html" --no-cli-pager