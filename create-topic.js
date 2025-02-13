
const path = require('path')
const { Kafka } = require('kafkajs')

const config = {
    clientId: 'npm-slack-notifier-admin',
    brokers: [process.env.BOOTSTRAP_BROKER || 'localhost:9092'],
    ssl: process.env.KAFKA_SSL ? JSON.parse(process.env.KAFKA_SSL) : false,
    sasl: process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD ? {
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD
    } : null
}

const kafka = new Kafka(config)
const admin = kafka.admin()

const topic = process.argv[2]
const numPartitions = process.argv[3] && !isNaN(process.argv[3])
    ? parseInt(process.argv[3], 10)
    : undefined

const help = () => {
    console.log(`${path.basename(__filename)} <topic> [numPartitions] e.g. ./create-topic.sh "my-topic" 1`)
    console.log()
    console.log('Ensure the following environment variables are set:')
    console.log('  * BOOTSTRAP_BROKER')
    console.log('  * KAFKA_SSL')
    console.log('  * KAFKA_USERNAME')
    console.log('  * KAFKA_PASSWORD')
}

if (!topic) {
    help()
    process.exit(1)
}

admin.connect().then(() => {
    return admin.createTopics({
        topics: [{
            topic,
            numPartitions
        }]
    })
}).then(() => {
    admin.disconnect()
}).then(() => {
    process.exit(0)
})
.catch(error => {
    console.error(error)
    console.log()
    help()
    process.exit(1)
})