module.exports = function(RED) {
  // Required modules
  const OpenRGB = require('openrgb-sdk');

  // Function to set the color of a device
  function setDeviceColor(server, port, deviceId, color) {
    const openRGB = new OpenRGB({
      server,
      port
    });

    openRGB.init()
      .then(() => {
        const device = openRGB.getController(deviceId);
        if (!device) {
          console.error('Device not found');
          return;
        }

        const [r, g, b] = hexToRgb(color);
        device.setColor(0, r, g, b);
      })
      .catch((error) => {
        console.error('OpenRGB initialization failed', error);
      });
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
    const server = config.server;
    const port = config.port;

    // Handle incoming messages
    this.on('input', function(msg) {
      const selectedDevice = parseInt(config.device);
      const color = msg.payload;

      // Set the color of the selected device
      setDeviceColor(server, port, selectedDevice, color);

      // Pass the original message to the next node
      node.send(msg);
    });
  }

  // Register the custom node
  RED.nodes.registerType('openrgb-color-setter', OpenRGBColorSetterNode);

  // Provide the list of devices as configuration options for the custom node
  RED.httpAdmin.get('/openrgb-devices', function(req, res) {
    // Retrieve the server and port from the request query
    const server = req.query.server || '';
    const port = req.query.port || '';

    // Create an instance of OpenRGB
    const openRGB = new OpenRGB({server,port});

    openRGB.init()
      .then(() => {
        // Fetch the device list
        const devices = openRGB.getAllControllers().map((device) => ({
          id: device.deviceId,
          name: device.name,
        }));

        res.json(devices);
      })
      .catch((error) => {
        console.error('OpenRGB initialization failed', error);
        res.status(500).send('OpenRGB initialization failed');
      });
  });
};
