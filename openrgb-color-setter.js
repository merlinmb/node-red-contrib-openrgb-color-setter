module.exports = function(RED) {
  // Required modules
  const OpenRGB = require('openrgb-sdk');

  // Create an instance of OpenRGB
  const openRGB = new OpenRGB();

  // Initialize the connection to the OpenRGB server
  openRGB.init();

  // List of available devices
  const deviceList = [
    { name: 'Device 1', id: 1 },
    { name: 'Device 2', id: 2 },
    // Add more devices as needed
  ];

  // Function to set the color of a device
  function setDeviceColor(deviceId, color) {
    const device = openRGB.getController(deviceId);
    if (!device) {
      console.error('Device not found');
      return;
    }

    const [r, g, b] = hexToRgb(color);
    device.setColor(0, r, g, b);
  }

  // Helper function to convert HEX color to RGB
  function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  // Function node
  function OpenRGBColorSetterNode(config) {
    RED.nodes.createNode(this, config);

    const node = this;

    // Handle incoming messages
    this.on('input', function(msg) {
      const selectedDevice = parseInt(config.device);
      const color = msg.payload;

      // Set the color of the selected device
      setDeviceColor(selectedDevice, color);

      // Pass the original message to the next node
      node.send(msg);
    });
  }

  // Register the custom node
  RED.nodes.registerType('openrgb-color-setter', OpenRGBColorSetterNode);

  // Provide the list of devices as configuration options for the custom node
  RED.httpAdmin.get('/openrgb-devices', function(req, res) {
    res.json(deviceList);
  });
};
