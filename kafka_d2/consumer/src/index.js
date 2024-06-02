import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "consumer",
    brokers: ["127.0.0.1:9092"]
});

const consumer = kafka.consumer({ groupId: "consumer-group" });
const producer = kafka.producer();

async function processMessage(product) {
    

    console.log("Procesando mensaje: ", product.estado);


    // Enviar el producto actualizado a la cola
    await producer.connect();

    await producer.send({
        topic: "notifications",
        messages: [{ value: JSON.stringify(product) }]
    });

    // Simular un retraso antes de la siguiente etapa
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Etapa 2: Cambiar el estado del producto a "preparando"
    product.estado = "preparando";

    // Enviar el producto actualizado a la cola
    await producer.send({
        topic: "notifications",
        messages: [{ value: JSON.stringify(product) }]
    });

    // Simular un retraso antes de la siguiente etapa
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Etapa 3: Cambiar el estado del producto a "entregando"
    product.estado = "entregando";

    // Enviar el producto actualizado a la cola
    await producer.send({
        topic: "notifications",
        messages: [{ value: JSON.stringify(product) }]
    });

    // Simular un retraso antes de la siguiente etapa
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Etapa 4: Cambiar el estado del producto a "finalizado"
    product.estado = "finalizado";

    // Enviar el producto actualizado a la cola
    await producer.send({
        topic: "notifications",
        messages: [{ value: JSON.stringify(product) }]
    });

    await producer.disconnect();
}

async function startConsumer() {
    await consumer.connect();
    await consumer.subscribe({ topic: "test", fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const produc = JSON.parse(message.value.toString());
            const product = {...produc, estado: "recibido"};

            console.log("Enviando producto...");
            await processMessage(product);
        }
    });
}

// Iniciar el consumidor
startConsumer();
