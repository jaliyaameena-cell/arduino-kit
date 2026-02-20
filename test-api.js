// Test script for /api/generate endpoint
const testData = {
    sensors: [
        "Humidity Temperature Sensor",
        "Moisture Sensor",
        "Light Sensor",
        "Power LED"
    ]
};

console.log('Testing POST /api/generate');
console.log('Payload:', JSON.stringify(testData, null, 2));
console.log('\nTo test this endpoint:');
console.log('1. Start your development server: npm run dev (or bun dev)');
console.log('2. Use Postman or curl:\n');
console.log('curl -X POST http://localhost:3000/api/generate \\');
console.log('  -H "Content-Type: application/json" \\');
console.log(`  -d '${JSON.stringify(testData)}'`);
console.log('\n3. Or use this JavaScript fetch:\n');
console.log(`fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${JSON.stringify(testData, null, 2)})
})
.then(r => r.json())
.then(data => console.log(data.result))
.catch(e => console.error(e));`);
