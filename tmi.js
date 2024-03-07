const tmi = require('tmi.js');

const client = new tmi.Client({
    options: { debug: true },
    connection: {
        secure: true,
        reconnect: true
    },
    channels: [ 'DirectorEgg' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if(self || !message.startsWith('!spin')) return;

    const username = tags['display-name'];
    // Emit an event to the front-end to spin the reels
});
