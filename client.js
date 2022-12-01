const { Client } = require('discord.js-selfbot-v13');
const { RETRY_LIMIT, TIMEOUT } = require('./config');
const { COMMAND_FIELDS, EMBED_FIELDS, MESSAGE_FIELDS, OPTION_FIELDS, } = require('./fields-config');

const { CHANNEL_ID, TARGET_ID, TOKEN } = process.env;

const client = new Client({ checkUpdate: false });

const pickArr = (obj, paths) => obj.map(e => pick(e, paths));
const pick = (obj, paths) => paths
    ? paths.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
    : obj;

const getChannel = async ({ channelId = CHANNEL_ID, targetId = TARGET_ID }) => {
    const getChannelIdFromTarget = async (targetId) => {
        const target = await client.users.fetch(targetId);
        channelId = (await target.send('hi')).channelId;
        return channelId;
    }
    return client.channels.fetch(channelId || await getChannelIdFromTarget(targetId));
}

const getCommands = async ({ channelId, targetId, commandFields, optionFields }) => {
    const channel = await getChannel({ channelId, targetId });
    return getChannelCommands({ channel, commandFields, optionFields });
}

const getChannelCommands = async ({ channel, commandFields = COMMAND_FIELDS, optionFields = OPTION_FIELDS }) => {
    let commands = await channel.recipient.application.commands.fetch();
    commands = pickArr(commands, commandFields).map(({ options, ...cmd }) => (
        { options: pickArr(options, optionFields), ...cmd })
    );
    return commands;
}

const getSlashReply = async ({ channelId, targetId, commandName, ...args }) => {
    const channel = await getChannel({ channelId, targetId });
    const slash = await sendSlash({ channel, commandName, args });
    return getReply(slash);
}

const sendSlash = async ({ channel, commandName, args }) => {
    const commands = await getChannelCommands({ channel });
    const { options } = commands.filter(cmd => cmd.name === commandName)[0];
    const optionsArr = options.map(({ name }) => args[name]);
    return channel.sendSlash(channel.recipient.id, commandName, optionsArr);
}


const getReply = async ({ id }) => {
    const replyListenerCallback = resolve => reply => {
        if (reply.reactions.message.interaction?.id === id) {
            // console.log(49183, reply, this)
            const message = pick(reply.reactions.message, MESSAGE_FIELDS);
            message.embeds = pickArr(message.embeds, EMBED_FIELDS);
            resolve(message);
        };
    }

    const replyListener = event => {
        let callback;
        const listener = new Promise(resolve => client.on(event, callback = replyListenerCallback(resolve)))
        return { callback, listener }
    };

    const messageCreate = replyListener('messageCreate');
    const messageUpdate = replyListener('messageUpdate');

    const res = await Promise.race([
        messageCreate.listener,
        messageUpdate.listener,
        new Promise(resolve => setTimeout(resolve, TIMEOUT))
    ]);

    client.removeListener('messageCreate', messageCreate.callback);
    client.removeListener('messageUpdate', messageUpdate.callback);

    return res;
}

client.once('ready', async () => {
    console.log('Logged in as:', client.user.username);
})

// const retry = async (cmd, count = RETRY_LIMIT) => {
//     const ret = await cmd();
//     return ret || !count ? ret : retry(cmd, count - 1);
// };

client.login(TOKEN);
// client.on('messageCreate', z => console.log('messageCreate', z));
// client.on('messageUpdate', z => console.log('messageUpdate', z));

module.exports = { getCommands, getSlashReply };