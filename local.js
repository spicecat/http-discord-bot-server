const app = require('./app'), { PORT } = require('./config');

app.listen(PORT, console.log('Listening at port:', PORT));