#!/bin/bash

concord_url="$1"
authToken="$2"
event="$3"
payload="$4"
retries="${5:-3}"
delay="${6:-5}"
success=false

options="--http1.1"

for ((attempt=1; attempt<=$retries+1; attempt++)); do

  response=$(curl $options -s -w "%{http_code}" -v \
    -H "Content-Type: application/json" \
    -H "Authorization: $authToken" \
    -d "payload" \
    -o /dev/null \
    "$concord_url/api/v1/events/$event")

  status_code="${response: -3}"

  if [[ $status_code == "200" ]]; then
    echo "Request sent successfully"
    success=true
    break
  else
    echo "Error sending request. Status code: $status_code"
    if [[ $attempt > $retries ]]; then
      break
    fi
    echo "retry #$attempt in $delay seconds"
    sleep $delay
  fi
done

if [[ $success == false ]]; then
  exit 1
fi
