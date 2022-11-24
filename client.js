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
            console.log(49183, reply, this)
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

// client.on('applicationCommandPermissionsUpdate', z => console.log('applicationCommandPermissionsUpdate', z));
// client.on('autoModerationActionExecution', z => console.log('autoModerationActionExecution', z));
// client.on('autoModerationRuleCreate', z => console.log('autoModerationRuleCreate', z));
// client.on('autoModerationRuleDelete', z => console.log('autoModerationRuleDelete', z));
// client.on('autoModerationRuleUpdate', z => console.log('autoModerationRuleUpdate', z));
// client.on('channelCreate', z => console.log('channelCreate', z));
// client.on('channelDelete', z => console.log('channelDelete', z));
// client.on('channelPinsUpdate', z => console.log('channelPinsUpdate', z));
// client.on('channelUpdate', z => console.log('channelUpdate', z));
// client.on('debug', z => console.log('debug', z));
// client.on('emojiCreate', z => console.log('emojiCreate', z));
// client.on('emojiDelete', z => console.log('emojiDelete', z));
// client.on('emojiUpdate', z => console.log('emojiUpdate', z));
// client.on('error', z => console.log('error', z));
// client.on('guildBanAdd', z => console.log('guildBanAdd', z));
// client.on('guildBanRemove', z => console.log('guildBanRemove', z));
// client.on('guildCreate', z => console.log('guildCreate', z));
// client.on('guildDelete', z => console.log('guildDelete', z));
// client.on('guildIntegrationsUpdate', z => console.log('guildIntegrationsUpdate', z));
// client.on('guildMemberAdd', z => console.log('guildMemberAdd', z));
// client.on('guildMemberAvailable', z => console.log('guildMemberAvailable', z));
// client.on('guildMemberRemove', z => console.log('guildMemberRemove', z));
// client.on('guildMembersChunk', z => console.log('guildMembersChunk', z));
// client.on('guildMemberUpdate', z => console.log('guildMemberUpdate', z));
// client.on('guildScheduledEventCreate', z => console.log('guildScheduledEventCreate', z));
// client.on('guildScheduledEventDelete', z => console.log('guildScheduledEventDelete', z));
// client.on('guildScheduledEventUpdate', z => console.log('guildScheduledEventUpdate', z));
// client.on('guildScheduledEventUserAdd', z => console.log('guildScheduledEventUserAdd', z));
// client.on('guildScheduledEventUserRemove', z => console.log('guildScheduledEventUserRemove', z));
// client.on('guildUnavailable', z => console.log('guildUnavailable', z));
// client.on('guildUpdate', z => console.log('guildUpdate', z));
// client.on('interactionCreate', z => console.log('interactionCreate', z));
// client.on('invalidated', z => console.log('invalidated', z));
// client.on('inviteCreate', z => console.log('inviteCreate', z));
// client.on('inviteDelete', z => console.log('inviteDelete', z));
// client.on('messageCreate', z => console.log('messageCreate', z));
// client.on('messageDelete', z => console.log('messageDelete', z));
// client.on('messageDeleteBulk', z => console.log('messageDeleteBulk', z));
// client.on('messageReactionAdd', z => console.log('messageReactionAdd', z));
// client.on('messageReactionRemove', z => console.log('messageReactionRemove', z));
// client.on('messageReactionRemoveAll', z => console.log('messageReactionRemoveAll', z));
// client.on('messageReactionRemoveEmoji', z => console.log('messageReactionRemoveEmoji', z));
// client.on('messageUpdate', z => console.log('messageUpdate', z));
// client.on('presenceUpdate', z => console.log('presenceUpdate', z));
// client.on('ready', z => console.log('ready', z));
// client.on('Client', z => console.log('Client', z));
// client.on('roleDelete', z => console.log('roleDelete', z));
// client.on('roleUpdate', z => console.log('roleUpdate', z));
// client.on('shardDisconnect', z => console.log('shardDisconnect', z));
// client.on('shardError', z => console.log('shardError', z));
// client.on('shardReady', z => console.log('shardReady', z));
// client.on('shardReconnecting', z => console.log('shardReconnecting', z));
// client.on('shardResume', z => console.log('shardResume', z));
// client.on('stageInstanceCreate', z => console.log('stageInstanceCreate', z));
// client.on('stageInstanceDelete', z => console.log('stageInstanceDelete', z));
// client.on('stageInstanceUpdate', z => console.log('stageInstanceUpdate', z));
// client.on('stickerCreate', z => console.log('stickerCreate', z));
// client.on('stickerDelete', z => console.log('stickerDelete', z));
// client.on('stickerUpdate', z => console.log('stickerUpdate', z));
// client.on('threadCreate', z => console.log('threadCreate', z));
// client.on('threadDelete', z => console.log('threadDelete', z));
// client.on('threadListSync', z => console.log('threadListSync', z));
// client.on('threadMembersUpdate', z => console.log('threadMembersUpdate', z));
// client.on('threadMemberUpdate', z => console.log('threadMemberUpdate', z));
// client.on('threadUpdate', z => console.log('threadUpdate', z));
// client.on('typingStart', z => console.log('typingStart', z));
// client.on('userUpdate', z => console.log('userUpdate', z));
// client.on('voiceStateUpdate', z => console.log('voiceStateUpdate', z));
// client.on('warn', z => console.log('warn', z));
// client.on('webhookUpdate', z => console.log('webhookUpdate', z))

module.exports = { getCommands, getSlashReply };