const { Client } = require('discord.js-selfbot-v13');
const { RETRY_LIMIT, TIMEOUT } = require('./config');
const { COMMAND_FIELDS, COMMAND_TYPES, EMBED_FIELDS, MESSAGE_FIELDS, OPTION_FIELDS, } = require('./fields-config');

const { CHANNEL_ID, TARGET_ID, TOKEN } = process.env;

const client = new Client({ checkUpdate: false });

const pickArr = (obj, paths) => obj.map(e => pick(e, paths));
const pick = (obj, paths) => paths
    ? paths.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
    : obj;

const getChannel = async ({ channelId = CHANNEL_ID, targetId = TARGET_ID }) => {
    const getChannelIdFromTarget = async (targetId) => {
        const target = await client.users.fetch(targetId);
        const message = await target.send('hi');
        return message.channelId;
    }
    return client.channels.fetch(channelId || await getChannelIdFromTarget(targetId))
}

const getCommands = async ({ channelId, targetId, commandFields, optionFields }) => {
    const channel = await getChannel({ channelId, targetId });
    return getChannelCommands({ channel, commandFields, optionFields });
}

const getChannelCommands = async ({ channel, commandFields = COMMAND_FIELDS, optionFields = OPTION_FIELDS }) => {
    let commands = await channel.recipient.application.commands.fetch();
    commands = commands.filter(({ type }) => COMMAND_TYPES.includes(type))
    commands = pickArr(commands, commandFields).map(({ options, ...cmd }) => (
        { options: pickArr(options, optionFields), ...cmd })
    );
    return commands;
}

const getSlashReply = async ({ channelId, targetId, commandName, ...args }) => {
    const channel = await getChannel({ channelId, targetId });
    const slash = await sendSlash({ channel, commandName, args });
    return getReply({ channel, slash });
}

const sendSlash = async ({ channel, commandName, args }) => {
    const commands = await getChannelCommands({ channel });
    const command = commands.filter(cmd => cmd.name === commandName)[0];
    const { options } = command
    const optionsArr = options.map(({ name }) => args[name]);
    return channel.sendSlash(channel.recipient.id, commandName, optionsArr);
}


const getReply = async ({ channel, slash, max = 1, messageUpdate }) => {
    console.log(1039999, slash.nonce)

    const filter = msg => {
        console.log(1029999, msg.nonce === slash.nonce, msg.reactions, msg)
        return msg.nonce === slash.nonce && (msg.content || msg.embeds.length);
    }

    if (messageUpdate) {
        const replyListenerCallback = resolve => reply => {
            if (filter(reply)) {
                console.log(49183, reply)
                resolve(message);
            };
        }

        const replyListener = event => {
            let callback;
            const listener = new Promise(resolve => {
                callback = replyListenerCallback(resolve);
                client.on(event, callback);
            })
            return { callback, listener }
        };

        const messageUpdateListener = replyListener('messageUpdate');

        const res = await Promise.race([
            messageUpdateListener.listener,
            new Promise(resolve => setTimeout(resolve, TIMEOUT))
        ]);
        // const message = pick(reply.reactions.message, MESSAGE_FIELDS);
        // message.embeds = pickArr(message.embeds, EMBED_FIELDS);
        console.log(200999, res)
        return res;
    }

    return new Promise(resolve => {
        channel.awaitMessages({ filter, max, time: TIMEOUT, errors: ['time'] })
            .then(collected => {
                console.log(84576, collected)
                resolve(collected)
            })
            .catch(collected => {
                console.log(4357, collected)
                resolve(collected)
            });
    })
}

client.once('ready', () => {
    console.log('Logged in as:', client.user.username);
});

client.login(TOKEN);

module.exports = { getCommands, getSlashReply };