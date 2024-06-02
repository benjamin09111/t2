import { Kafka } from "kafkajs";
import express from "express";
import bodyParser from "body-parser";


//#######################

function generarIDUnico() {
    const marcaTiempo = new Date().getTime(); // Marca de tiempo actual en milisegundos
    const numeroAleatorio = Math.random().toString(36).substr(2, 9); // Número aleatorio convertido a cadena
    const idUnico = marcaTiempo + '-' + numeroAleatorio; // Combina la marca de tiempo con el número aleatorio
    return idUnico;
}

//#######################

//creamos productor
const kafka = new Kafka({
    clientId: "producer",
    brokers: ["127.0.0.1:9092"],
});

const producer = kafka.producer();

const app = express("express");
const port = 3000;

app.use(bodyParser.json());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//solicitud para registrar una persona

app.post("/", async (req, res) => {
    // Recibir el JSON del producto desde la solicitud POST
    const { nombre, precio, correo } = req.body;

    // Generar un identificador único para el producto
    const id = generarIDUnico();

    // Formar el objeto de producto con el ID único
    const producto = {
        id,
        nombre,
        precio,
        correo
    };

    // Enviar el producto al topic de Kafka
    await producer.connect();
    await producer.send({
        topic: "test",
        messages: [{ value: JSON.stringify(producto) }]
    });

    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});