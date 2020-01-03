var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
var express = require("express");
var app = express();
var path = require("path");

client.connectRTUBuffered("COM8", { baudRate: 9600, parity: "none" });

function connect() {
  client.connectRTUBuffered("COM8", { baudRate: 9600, parity: "none" });
}
client.setTimeout(5000);

app.use(express.static("public"));

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/read/:id", function(req, res) {
  client.setID(parseInt(req.params.id));
  client.readHoldingRegisters(0, 8, function(err, data) {
    if (data == null) {
      client.close(function() {
        connect();
      });
    } else {
      res.json(data.data);
    }
  });
});

app.listen(3001, function() {
  console.log("listening on localhost:3001");
});
