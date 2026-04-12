const express = require("express");
const fs = require("fs");

const app = express();

// Desbloquear Requisição cross-origin (CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// permite receber POST do ESP32
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// 🔹 ENDPOINT PRINCIPAL (ESP32 envia aqui)
app.post("/sensor", (req, res) => {

  const { device, distance } = req.body;

  if (!distance) {
    return res.json({
      status: "erro",
      msg: "distance não recebido"
    });
  }

  const fs = require("fs");
  let distanciaAnterior = null;
  
  // lê valor anterior
  if (fs.existsSync("dados.json")) {
    const dadosAntigos = JSON.parse(fs.readFileSync("dados.json"));
    distanciaAnterior = dadosAntigos.distance + 0.1;
  }

  const dados = {
    device: device || "caixa01",
    distance: parseFloat(distance),
    distanciaAnterior: distanciaAnterior,
    timestamp: new Date()
  };

  // salva em arquivo
  fs.writeFileSync("dados.json", JSON.stringify(dados, null, 2));

  console.log("Recebido:", dados);

  res.json({
    status: "ok",
    recebido: dados
  });
});


// 🔹 ENDPOINT PARA DASHBOARD
app.get("/", (req, res) => {
  res.send("API Sensor funcionando 🚀");
});

app.get("/dados", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (fs.existsSync("dados.json")) {
    res.sendFile(__dirname + "/dados.json");
  } else {
    res.json({
      device: "caixa01",
      distance: 50
    });
  }

});


app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
