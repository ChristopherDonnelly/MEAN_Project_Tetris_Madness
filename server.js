const xp = require("express");
const bp = require("body-parser");

const port = 8000;

const app = xp();

app.use(bp.json());
app.use(xp.static(__dirname + '/client/dist'));

require('./server/config/mongoose.js');
require('./server/config/routes.js')(app);

app.listen(8000, () => { 
    console.log(`Server running on port #${port}`);
});

