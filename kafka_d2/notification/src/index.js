import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import express from "express";

const app = express();
const port = 3001;

const kafka = new Kafka({
    clientId: "notification",
    brokers: ["127.0.0.1:9092"]
});

var registro = [];

const consumer = kafka.consumer({ groupId: "notification-group" });

async function sendNotification(product, estado) {

    const {id, nombre, correo} = product;

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'benjaminmoralespizarro5@gmail.com',
      pass: 'vccvuovmfdxkiidr '
    }
  });
  
  var mailOptions = {
    from: 'benjaminmoralespizarro5@gmail.com',
    to: 'benjaminmoralespizarro5@gmail.com',
    subject: `Producto ${id}`,
    text: `Su producto ${nombre} se encuentra en el estado "${estado}".`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    }
  }); 
}

async function processMessage(product) {
  console.log("Enviando: ", product);

  // Obtener el estado del producto del mensaje
  const estado = product.estado;

  // Enviar la notificación según el estado
  if (estado === "recibido") {
      await sendNotification(product, "recibido");
      registro.push(product);
      console.log("Notificacion enviada.");
  } else if (estado === "preparando") {
      await sendNotification(product, "preparando");
      registro.push(product);
      console.log("Notificacion enviada.");
  } else if (estado === "entregando") {
      await sendNotification(product, "entregando");
      registro.push(product);
      console.log("Notificacion enviada.");
  } else if (estado === "finalizado") {
      await sendNotification(product, "finalizado");
      registro.push(product);
      console.log("Notificacion enviada.");
  }
}

async function searchProductByID(id) {
  let latestProduct = null;

  registro.map(producto => {
    if(producto.id == id){
      latestProduct = producto;
    }
  })

  return latestProduct;
}

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  const product = await searchProductByID(id);

  if (product) {
      res.json(product);
  } else {
      res.status(404).json({ error: "Producto no encontrado" });
  }
});

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "notifications", fromBeginning: false });

  await consumer.run({
      eachMessage: async ({ message }) => {
          // Parsear el mensaje a JSON
          const product = JSON.parse(message.value.toString());
          console.log("Recibiendo producto de notificaciones...");
          await processMessage(product);
      }
  });
}

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);})

// Iniciar el consumidor de notificaciones
startConsumer();
