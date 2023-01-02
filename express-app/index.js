const express = require('express');

const server = express();

server.use(express.static('public'));

if (process.env.PORT === undefined) {
    throw new Error('PORT env variable not defined!');
}

server.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}!`);
})