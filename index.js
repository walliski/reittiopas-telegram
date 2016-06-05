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
            var text = body[0].code_short + ": " + body[0].name_fi + " - " + body[0].name_sv;
            bot.sendMessage(msg.chat.id, text).then(function () {
                // done
            });
        } else {
            bot.sendMessage(msg.chat.id, "Stop not found!").then(function () {
                // done
            });
        }
    });
});