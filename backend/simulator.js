function generateSensorData() {
  const temperature = (20 + Math.random() * 25).toFixed(2);
  const humidity = (30 + Math.random() * 60).toFixed(2);
  const voltage = (3 + Math.random() * 2).toFixed(2);

  const latitude = (12.80 + Math.random() * 0.40).toFixed(6);
  const longitude = (77.40 + Math.random() * 0.40).toFixed(6);

  let status = "Online";

  if (temperature > 40) {
    status = "Warning";
  }

  if (voltage < 3.2) {
    status = "Offline";
  }

  return {
    temperature,
    humidity,
    voltage,
    latitude,
    longitude,
    status,
    timestamp: new Date(),
  };
}

module.exports = generateSensorData;