var telegramBot = require('node-telegram-bot-api');
var request = require('request');

var settings = require('./settings.js');

var bot = new telegramBot(settings.tgToken, {polling: true});

bot.onText(/^\/stop (.+)$/, function (msg, match) {
    var busStop = match[1];
    var url = "http://api.reittiopas.fi/hsl/prod/?request=stop&user=" + settings.reittiopasUser + "&pass=" + settings.reittiopasPass + "&format=json&code=" + busStop;

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (body != null) {
            var text = body[0].code_short + ": *" + body[0].name_fi + " - " + body[0].name_sv + "*";
            if (body[0].departures != null) {
                for (var i = 0; i < body[0].departures.length; i++) {
                    // parse departure time
                    var rawTime = "" + body[0].departures[i].time;
                    var time = "";
                    if (parseInt(rawTime.charAt(0)) < 2 || parseInt(rawTime.charAt(1)) < 4) {
                        if (parseInt(rawTime.charAt(0)) !== 0)
                            time += rawTime.charAt(0);
                        time += rawTime.charAt(1);
                    } else {
                        time += (parseInt(rawTime.charAt(1)) - 4);
                    }
                    time += ":";
                    time += rawTime.charAt(2);
                    time += rawTime.charAt(3);

                    text += "\n" + time + " " + body[0].departures[i].code;
                }
            } else {
                text += "\nNo more departures today!";
            }
            bot.sendMessage(msg.chat.id, text, {parse_mode: "Markdown"}).then(function () {
                // done
            });
        } else {
            bot.sendMessage(msg.chat.id, "Stop not found!").then(function () {
                // done
            });
        }
    });
});