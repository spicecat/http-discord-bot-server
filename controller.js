const { getCommands, getSlashReply } = require('./client');

const getCommandsController = async (req, res) => {
    try {
        const commands = await getCommands(req.query);
        res.send(commands);
    } catch (err) {
        res.sendStatus(400);
    }
}

const postSlashController = async (req, res) => {
    try {
        const reply = await getSlashReply(req.query);
        res.send(reply);
    } catch (err) {
        res.sendStatus(400);
    }
};

module.exports = { getCommandsController, postSlashController };