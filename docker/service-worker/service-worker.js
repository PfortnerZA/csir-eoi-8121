
const mqtt = require("mqtt");

const MQTT_URL = process.env.MQTT_URL || "mqtt://mosquitto:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC || "weather/open-meteo/current";
const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS || 5000);

const client = mqtt.connect(MQTT_URL, {
	reconnectPeriod: 5000,
	connectTimeout: 10000,
});

client.on("connect", () => {
	console.log(`Connected to MQTT at ${MQTT_URL}`);
	startPolling();
});

client.on("reconnect", () => console.log("Reconnecting to MQTT..."));
client.on("error", (err) => console.error("MQTT error:", err.message));

let pollingStarted = false;

function startPolling() {
	if (pollingStarted) return;
	pollingStarted = true;

	pollAndPublish();
	setInterval(pollAndPublish, POLL_INTERVAL_MS);
}

function getRandomValue(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomWeatherCode() {
	const codes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 95];
	return codes[Math.floor(Math.random() * codes.length)];
}

async function pollAndPublish() {
	try {
		const payload = JSON.stringify({
			time: new Date().toISOString(),
			temperature: Number(getRandomValue(10, 35).toFixed(1)),
			windspeed: Number(getRandomValue(0, 40).toFixed(1)),
			winddirection: Math.floor(getRandomValue(0, 360)),
			weathercode: getRandomWeatherCode(),
		});

		client.publish(MQTT_TOPIC, payload, { qos: 0 }, (err) => {
			if (err) {
				console.error("MQTT publish error:", err.message);
				return;
			}

			console.log(`Published weather data to ${MQTT_TOPIC}`);
		});
	} catch (err) {
		console.error("Polling error:", err.message);
	}
}
