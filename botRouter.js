const express = require('express');
const router = express.Router();

const { getCommandsController, postSlashController } = require('./controller');

router.get('/', (req, _, next) => {
    console.log(req.path, req.query)
    next()
}, getCommandsController);
router.post('/', (req, _, next) => {
    console.log(req.path, req.query)
    next()
}, postSlashController);

module.exports = router;