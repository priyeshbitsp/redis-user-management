const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis');

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);
const app = express();


// Set response
function setResponse(username, repos) {
    return `<h2>${username} has ${repos} Github repos</h2>`;
}
  
// Make request to Github for data
async function getRepos(req, res, next) {
    try {
        console.log('Fetching Data...');

        const { username } = req.params;

        const response = await fetch(`https://api.github.com/users/${username}`);

        const data = await response.json();

        const repos = data.public_repos;

        // Set data to Redis. Expiration time is 1 hr
        client.setex(username, 3600, repos);
        console.log("Caching it");

        res.send(setResponse(username, repos));
    } catch (err) {
        console.error(err);
        res.status(500);
    }
}

// Cache middleware. Not only speeds up time, but also limits the no. of requests made. 
// There could be max limit of requests that can be made to a server
function cache(req, res, next) {
    console.log("Checking in the redis cache");
    const { username } = req.params;

    client.get(username, (err, data) => {
        if (err) throw err;

        if (data !== null) {
            res.send(setResponse(username, data));
        } else {
            next();
        }
    });
}

app.get('/repos/:username', cache, getRepos);


app.listen(PORT, () => {
    console.log(`Comparison index listening on port ${PORT}`);
});