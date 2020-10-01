var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
var express = require("express");
var app = express();
var path = require("path");
var db = require('./database');
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

client.connectRTUBuffered("COM5", { baudRate: 9600, parity: "none" });

db.execute('CREATE TABLE IF NOT EXISTS parameters (_id INT PRIMARY KEY AUTO_INCREMENT, temp VARCHAR(5), hum VARCHAR(5), pm2_5 VARCHAR(5), pm10 VARCHAR(5), co2 VARCHAR(5), voc VARCHAR(5), ts DATETIME DEFAULT CURRENT_TIMESTAMP)')
  .then(result => {
    console.log('Database Synced')
  })
  .catch(error => {
    console.log(error)
  })

function connect() {
  client.connectRTUBuffered("COM5", { baudRate: 9600, parity: "none" });
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

app.get("/savedata", (req, res) => {
    console.log("ees:" + req.query)
    var temp = req.query.temp
    var hum = req.query.hum
    var pm2_5 = req.query.pm2_5
    var pm10 = req.query.pm10
    var co2 = req.query.co2
    var voc = req.query.voc
    db.execute("INSERT INTO parameters VALLUES(NULL, '" + temp+ "', '" + hum + "', '" + pm2_5 + "', '" + pm10 + "', '" + co2 + "', '" + voc + "', NULL)")
      .then(() => {
        res.json('added')
      })
      .catch(error => {
        res.json('db error')
      })
})

app.get("/getdata", (req, res) => {
    db.execute('SELECT ts, temp, hum, pm2_5, pm10, co2, voc FROM parameters')
      .then(result => {
        const csvWriter = createCsvWriter({
          path: "aqm_data.csv",
          header: [
            { id: "ts", title: "Time Stamp" },
            { id: "temp", title: "Temperature(*C)" },
            { id: "hum", title: "Humidity(%)" },
            { id: "pm2_5", title: "PM2.5(PPM)" },
            { id: "pm10", title: "PM10(PPM)" },
            { id: "co2", title: "CO2(PPM)" },
            { id: "voc", title: "VOC(PPB)" }
          ]
        });
        csvWriter
          .writeRecords(result[0])
          .then(() =>
            res.json('success')
          );
      })
      .catch(error => {
        console.log(error)
      })
})

app.listen(3000, function() {
  console.log("listening on localhost:3000");
});
