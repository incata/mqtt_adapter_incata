"use strict";

module.exports = function(app,server) {
app.use("/node/chatServer", require("./routes/chatServer")(server));
};
