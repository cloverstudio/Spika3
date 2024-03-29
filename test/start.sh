#/bin/bash

export NODE_ENV=test
export DATABASE_URL=mysql://root:testtest@localhost:3307/db
export RABBITMQ_URL=amqp://myuser:mypassword@localhost
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=password
export PORT=4000
export USE_MNG_API=1
export USE_MSG_API=1
export USE_SMS=1
export USE_UPLOAD=1
export USE_PUSH=1
export USE_SSE=1
export IS_TEST=1
export UPLOAD_FOLDER="${PWD}/test/uploads"
export LOG_INFO=0
export LOG_WARN=0
export LOG_ERROR=0
export TEAM_MODE=1
export USE_MESSAGE_RECORDS_SSE=1
export USE_WEBHOOK=1
export USE_SSE=1
export USE_MESSAGING=1
export REDIS_URL="redis://localhost:6379"


npx prisma migrate reset --force && prisma migrate dev --name init --preview-feature
rm -rf ../test/upload

export TS_NODE_COMPILER_OPTIONS='{"module": "commonjs" , "noUnusedLocals": false}' 
mocha -r ts-node/register --file 'test/setup.ts' 'test/**/*.ts'

