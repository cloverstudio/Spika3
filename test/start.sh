#/bin/bash

export NODE_ENV=test
export DATABASE_URL=mysql://root:testtest@localhost:3307/db
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=password
export PORT=4000
export USE_MNG_API=1
export USE_MSG_API=1
export USE_SMS=1
export USE_UPLOAD=1
export IS_TEST=1
export UPLOAD_FOLDER=./test/upload

npx prisma migrate dev --name init --preview-feature 

export TS_NODE_COMPILER_OPTIONS='{"module": "commonjs" , "noUnusedLocals": false}' 
mocha -r ts-node/register 'test/**/*.ts' 