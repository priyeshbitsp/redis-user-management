# Redis User Management
## Usage
Simple user management app using Node.js and Redis
## Things to keep in mind before running
Make sure you have Redis installed and running
## Install Dependencies
```
$ npm install
```
## Run Server
```
$ npm start
```
## Comparison of response times wih and wihout redis-cache
```
npm run start-cache
```
Check load time of http://localhost:3000/repos/priyeshbitsp intially and then later once stored in redis

## Checking data of response times with and wihout redis-cache
- Open folder /usr/local/var/db/redis
- The encrypted key-value pair is stored in dump.rdb file

## Visit http://localhost:3000