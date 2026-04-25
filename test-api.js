const axios = require('axios');

async function testAPI() {
  try {
    const response = await axios.post('http://localhost:3000/api/chat', {
      messages: [
        {
          role: 'user',
          content: 'Hello, can you hear me?'
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'stream'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    let responseData = '';
    response.data.on('data', (chunk) => {
      responseData += chunk.toString();
      process.stdout.write(chunk.toString());
    });

    response.data.on('end', () => {
      console.log('\n\nFull response received');
    });

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
  }
}

testAPI();