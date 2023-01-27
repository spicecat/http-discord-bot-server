const { getCommands, getSlashReply } = require('./client');

BigInt.prototype.toJSON = toString;

const stringify = obj => Object.fromEntries(
    Object.entries(obj).map(
        ([k, v]) => [k, JSON.stringify(v)]
    )
);

const getCommandsController = async (req, res) => {
    try {
        const commands = await getCommands(req.query);
        res.send(commands[0]);
    } catch (err) {
        console.log(99, err)
        res.sendStatus(400);
    }
}

const postSlashController = async (req, res) => {
    try {
        const reply = await getSlashReply(req.query);
        res.send(stringify(reply));
    } catch (err) {
        console.log(99, err)
        res.sendStatus(400);
    }
};

module.exports = { getCommandsController, postSlashController };