const express = require('express');
const router = express.Router();

const { getCommandsController, postSlashController } = require('./controller');

const log = (req, _, next) => {
    console.log(req.path, req.query)
    next()
}

router.get('/', log, getCommandsController);
router.post('/', log, postSlashController);

module.exports = router;