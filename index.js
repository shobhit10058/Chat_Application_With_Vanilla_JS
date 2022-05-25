const inputMessage = document.querySelector(".chat_container input");
const messageContainer = document.querySelector(".message_container");
const usernameInput = document.querySelector(".username_form input");
const connectButton = document.querySelector(".username_form button");

inputMessage.setAttribute("disabled", true);
connectButton.setAttribute("disabled", true);

const clientId = "mqttjs_" + Math.random().toString(16).substring(2, 8);

const host = "wss://broker.emqx.io:8084/mqtt";
const CHANNEL_NAME = "main";

const options = {
  keepalive: 60,
  clientId: clientId,
  protocolId: "MQTT",
  secureProtocol: "TLS_method",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
};

console.log("Connecting mqtt client");
const client = mqtt.connect(host, options);

client.on("error", (err) => {
  console.log("Connection error: ", err);
  client.end();
});

client.on("reconnect", () => {
  console.log("Reconnecting...");
});

client.on("connect", () => {
  console.log("Client connected: " + clientId);
  // Subscribe
  client.subscribe(CHANNEL_NAME, { qos: 0 });
  connectButton.removeAttribute("disabled");
});

// Received
client.on("message", (topic, message, packet) => {
  console.log(
    "Received Message: " + message.toString() + "\nOn topic: " + topic
  );
  const newMessage = document.createElement("li");
  newMessage.innerHTML = message.toString();
  messageContainer.append(newMessage);
});

// send Message
const sendMessage = (channelName, message) => {
  client.publish(channelName, message, {
    qos: 0,
    retain: false,
  });
  inputMessage.value = "";
};

const startChat = () => {
  inputMessage.removeAttribute("disabled");
  inputMessage.addEventListener("change", (event) => {
    sendMessage(
      CHANNEL_NAME,
      `<strong>${usernameInput.value.toString()}</strong>: ${
        event.target.value
      }`
    );
  });
  sendMessage(
    CHANNEL_NAME,
    `<strong>${usernameInput.value.toString()}</strong> has joined!`
  );
};

connectButton.addEventListener("click", startChat);
