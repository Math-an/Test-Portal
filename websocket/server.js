const WebSocket = require('ws');
const { exec } = require('child_process');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8765 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const code = data.code;
    const stdin = data.stdin;

    // Save the code to a temporary file
    fs.writeFileSync('temp_code.js', code);

    // Execute the JavaScript code
    const command = `node temp_code.js`;
    const options = { input: stdin };

    exec(command, options, (error, stdout, stderr) => {
      let response;
      if (error) {
        response = {
          error: stderr
        };
      } else {
        response = {
          output: Buffer.from(stdout).toString('base64'),
          compilation_error: stderr ? Buffer.from(stderr).toString('base64') : null
        };
      }

      ws.send(JSON.stringify(response));
    });
  });
});

console.log('WebSocket server is running on ws://localhost:8765');
