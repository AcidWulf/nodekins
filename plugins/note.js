var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./localStorage');

var fuzzy = require('fuzzy');

/**
 * @param client
 *
 * Note plugin
 *
 * Depends on local storage
 *
 * Basic overview: creates and retrieves simple notes based on JSON keys
 *
 * Usage:
 *      .note
 *      > .note name (your message here)
 *
 *      .note something
 *      > Note not found, create one using: .note name (your message here)
 *
 *      .note something my note here
 *      > Saved
 *
 *      .note something
 *      > something: my note here
 */

module.exports.run = function (client) {
    client.addListener('message', function(nick, channel, message) {
        var params = message.split(' ');

        if (params[0] == '.note') {

            // Check for proper amount of args, proper args
            if (params.length < 2 || params[1] == '') {
                client.say(channel, '.note name (your message here)');
                return
            }

            // Convert all keys to lowercase to avoid confusion
            params[1] = params[1].toLowerCase();

            // Get stored list of args
            var notes = JSON.parse(localStorage.getItem('notes'));

            // Default object
            if (!notes) {
                notes = {};
            }

            if (params[1] && params[2]) {

                // Subtract first 2 params and spaces to get the message
                note = message.substr(params[0].length + params[1].length + 2);

                old_note = notes[params[1]];

                notes[params[1]] = note;

                localStorage.setItem('notes', JSON.stringify(notes));

                client.say(channel, 'Saved note for: ' + params[1] + (old_note ? ', Overwrote: ' + old_note: ''));

                return;
            }

            // Check if key exists
            if (notes[params[1]]) {
                client.say(channel, params[1] + ': ' + notes[params[1]])
            } else {

                var matches = [];

                // Do a fuzzy search for other potential notes
                fuzzy.filter(params[1], Object.keys(notes)).map(function(value) {
                    matches.push(value.string);
                });

                if (matches.length > 0) {
                    client.say(channel, 'Not found. Did you mean: ' + matches.join(' '));
                } else {
                    client.say(channel, 'Not found. Create a note with ".note name (your message here)"');
                }
            }
        }
    });
};

