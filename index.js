const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');

// MQTT Configuration
const mqttBrokerUrl = 'mqtt://localhost:1883';
const topic = 'my-topic';

// MongoDB Configuration
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'iot_db';
const collectionName = 'sensor_data';

// Connect to MongoDB
const client = new MongoClient(mongoUrl);

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Connect to MQTT broker
        const mqttClient = mqtt.connect(mqttBrokerUrl);

        mqttClient.on('connect', () => {
            console.log("Connected to MQTT broker");
            mqttClient.subscribe(topic, (err) => {
                if (!err) {
                    console.log(`Subscribed to topic: ${topic}`);
                }
            });
        });

        mqttClient.on('message', async (topic, message) => {
            const data = message.toString();
            console.log(`Message received: ${data}`);

            // Insert message into MongoDB
            try {
                await collection.insertOne({ data });
                console.log(`Inserted data into MongoDB: ${data}`);
            } catch (err) {
                console.error('Error inserting data into MongoDB', err);
            }
        });

    } catch (err) {
        console.error(err);
    }
}

run().catch(console.error);
