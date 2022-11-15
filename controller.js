const { getCommands, getSlashReply } = require('./client');

const getCommandsController = async (req, res) => {
    const commands = await getCommands(req.query);
    res.send(commands);
}

const postSlashController = async (req, res) => {
    try {
        const reply = await getSlashReply(req.query);
        res.send(reply);
    } catch (err) {
        res.sendStatus(404);
    }
};

module.exports = { getCommandsController, postSlashController };