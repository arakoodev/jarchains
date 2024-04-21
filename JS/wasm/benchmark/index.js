const autocannon = require('autocannon');

autocannon({
    url:"http://localhost:8080/quote?query=fun",
    connections: 100,
    pipelining: 1,
    duration:10
},console.log)