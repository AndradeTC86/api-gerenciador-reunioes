const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';

      res.on('data', (chunk) => {
        raw += chunk;
      });

      res.on('end', () => {
        const bodyResponse = raw ? JSON.parse(raw) : null;
        resolve({ status: res.statusCode, body: bodyResponse });
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, body: { error: error.message } });
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

module.exports = { request };