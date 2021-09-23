#/bin/bash

export NODE_ENV=test
export DATABASE_URL=mysql://root:testtest@localhost:3307/db
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=password
export PORT=4000

npx prisma migrate dev --name init --preview-feature 

export TS_NODE_COMPILER_OPTIONS='{"module": "commonjs" , "noUnusedLocals": false}' 
mocha -r ts-node/register 'test/**/*.ts' 