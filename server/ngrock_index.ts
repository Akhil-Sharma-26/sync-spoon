// ./index.js

const ngrok = require('ngrok');
// Import app from "./app file
const app = require("./src/index");

// Port that will be uses to listen to requests
const port = process.env.PORT || 3015;

(async function() {
    console.log("Initializing Ngrok tunnel...");

    // Initialize ngrok using auth token and hostname
    const url = await ngrok.connect({
        proto: "http",
        // Your authtoken if you want your hostname to be the same everytime
        authtoken: "",
        // Your hostname if you want your hostname to be the same everytime
        hostname: "",
        // Your app port
        addr: port,
    });

    console.log(`Listening on url ${url}`);
    console.log("Ngrok tunnel initialized!");
})();

/**
 * Listen on port 3015
 */
app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});