#!/bin/bash

set -e

cd bin
chmod 755 confd
ls -la
cd ..

echo "\n=== Generating .env file with values from Parameter Store for prefix "
pwd
AWS_REGION=ap-southeast-1 ./bin/confd -backend ssm -onetime -prefix /pg -confdir ./confd