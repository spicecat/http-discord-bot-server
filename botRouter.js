const express = require('express');
const router = express.Router();

const { getCommandsController, postSlashController } = require('./controller');

const log = (req, _, next) => {
    console.log(req.path, req.query);
    next();
}

const parseOptions = (req, _, next) => {
    if (req.query.options) req.query.options = JSON.parse(req.query.options);
    next();
}

router.use(parseOptions);
router.use(log);

router.get('/', getCommandsController);
router.post('/', postSlashController);

module.exports = router;