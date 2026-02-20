const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local from server/ if present, otherwise try project root
const serverEnv = path.resolve(__dirname, '.env.local');
const projectEnv = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(serverEnv)) {
    dotenv.config({ path: serverEnv });
} else if (fs.existsSync(projectEnv)) {
    dotenv.config({ path: projectEnv });
} else {
    dotenv.config();
}
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Middleware
app.use(cors());
app.use(express.json());

// Sensor and device mappings
const SENSOR_PIN_MAPPING = {
    'Humidity Temperature Sensor': 'D7',
    'Humidity & Temperature Sensor': 'D7',
    'Moisture Sensor': 'A0',
    'Distance Sensor': 'Trig: D5, Echo: D6',
    'Light Sensor': 'A1',
    'Motion Sensor': 'D3',
    'Flow Sensor': 'D2',
};

const OUTPUT_DEVICE_PIN_MAPPING = {
    'Buzzer': 'D8',
    'Multicolor LED': 'D9',
    'Relay': 'D4',
    'Power LED': 'D13',
};

const splitKnownComponents = (sensors) => {
    const safeSensors = Array.isArray(sensors) ? sensors : [];
    return {
        selectedSensors: safeSensors.filter((s) => s in SENSOR_PIN_MAPPING),
        selectedOutputs: safeSensors.filter((s) => s in OUTPUT_DEVICE_PIN_MAPPING),
    };
};

const CACHE_FILE = path.resolve(__dirname, 'prompt-cache.json');
const CACHE_VERSION = 1;
const PROMPT_VERSION = 'v5';

const normalizeList = (items) => [...items].sort((a, b) => a.localeCompare(b));

const buildCacheKey = (selectedSensors, selectedOutputs) =>
    JSON.stringify({
        version: CACHE_VERSION,
        promptVersion: PROMPT_VERSION,
        sensors: normalizeList(selectedSensors),
        outputs: normalizeList(selectedOutputs),
    });

const loadPromptCache = () => {
    if (!fs.existsSync(CACHE_FILE)) {
        return { version: CACHE_VERSION, entries: {} };
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        if (!parsed || typeof parsed !== 'object' || typeof parsed.entries !== 'object') {
            return { version: CACHE_VERSION, entries: {} };
        }
        if (parsed.version !== CACHE_VERSION) {
            return { version: CACHE_VERSION, entries: {} };
        }
        return parsed;
    } catch (error) {
        console.warn('Prompt cache is invalid JSON. Rebuilding cache file.');
        return { version: CACHE_VERSION, entries: {} };
    }
};

const savePromptCache = (cache) => {
    fs.writeFileSync(
        CACHE_FILE,
        JSON.stringify(
            {
                ...cache,
                version: CACHE_VERSION,
                updatedAt: new Date().toISOString(),
            },
            null,
            2
        ),
        'utf8'
    );
};

const cacheGuideResult = (key, selectedSensors, selectedOutputs, result, source) => {
    try {
        const cache = loadPromptCache();
        cache.entries[key] = {
            result,
            source,
            selectedSensors: normalizeList(selectedSensors),
            selectedOutputs: normalizeList(selectedOutputs),
            createdAt: new Date().toISOString(),
        };
        savePromptCache(cache);
    } catch (error) {
        console.warn('Failed to write prompt cache:', error instanceof Error ? error.message : error);
    }
};

const buildFallbackGuide = (selectedSensors, selectedOutputs) => {
    const usedInputs = selectedSensors.length > 0 ? selectedSensors : ['Moisture Sensor'];
    const usedOutputs = selectedOutputs.length > 0 ? selectedOutputs : ['Power LED'];
    const isDhtSensor = (name) =>
        name === 'Humidity Temperature Sensor' || name === 'Humidity & Temperature Sensor';

    const toConstName = (name) =>
        name
            .replace(/\W+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '')
            .toUpperCase();

    const digitalPinNumber = (pin) => {
        const match = pin.match(/^D(\d+)$/i);
        return match ? Number(match[1]) : null;
    };

    const pinMapLines = [
        ...usedInputs.map((sensor) => `- ${sensor}: ${SENSOR_PIN_MAPPING[sensor] || 'A0'}`),
        ...usedOutputs.map((device) => `- ${device}: ${OUTPUT_DEVICE_PIN_MAPPING[device] || 'D13'}`),
    ].join('\n');

    const sensorUseMap = {
        'Humidity Temperature Sensor':
            'Monitors ambient temperature and humidity to detect hot conditions.',
        'Humidity & Temperature Sensor':
            'Monitors ambient temperature and humidity to detect hot conditions.',
        'Moisture Sensor': 'Monitors soil moisture to detect dry soil conditions.',
        'Distance Sensor': 'Monitors object distance to detect near obstacles.',
        'Light Sensor': 'Monitors ambient light level to detect dark conditions.',
        'Motion Sensor': 'Monitors movement in the area.',
        'Flow Sensor': 'Monitors whether liquid flow is detected.',
    };

    const outputUseMap = {
        Buzzer: 'Makes sound when alert condition is true.',
        'Multicolor LED': 'Turns ON when alert condition is true.',
        Relay: 'Switches connected load ON when alert condition is true.',
        'Power LED': 'Lights up when alert condition is true.',
    };

    const includeLines = [];
    const pinDefinitions = [];
    const globalObjectLines = [];
    const setupLines = [];
    const readLines = [];
    const serialLines = [];
    const alertChecks = [];
    const outputLines = [];
    const triggerRuleLines = [];

    usedInputs.forEach((sensor) => {
        const mapping = SENSOR_PIN_MAPPING[sensor] || 'A0';
        const constBase = toConstName(sensor);

        if (isDhtSensor(sensor)) {
            const dhtPin = digitalPinNumber(mapping) ?? 7;
            includeLines.push('#include <DHT.h>');
            pinDefinitions.push(`const int DHT_PIN = ${dhtPin};`);
            pinDefinitions.push('#define DHTTYPE DHT11');
            globalObjectLines.push('DHT dht(DHT_PIN, DHTTYPE);');
            setupLines.push('  dht.begin();');
            readLines.push('  float temperatureC = dht.readTemperature();');
            readLines.push('  float humidityPercent = dht.readHumidity();');
            readLines.push('  if (isnan(temperatureC) || isnan(humidityPercent)) {');
            readLines.push('    Serial.println("DHT read failed. Check wiring.");');
            readLines.push('    delay(1000);');
            readLines.push('    return;');
            readLines.push('  }');
            serialLines.push('  Serial.print("Temperature (C): ");');
            serialLines.push('  Serial.println(temperatureC);');
            serialLines.push('  Serial.print("Humidity (%): ");');
            serialLines.push('  Serial.println(humidityPercent);');
            alertChecks.push('  if (temperatureC > 40.0) { alert = true; }');
            triggerRuleLines.push('- If temperature is above 40C, alert turns ON.');
            return;
        }

        if (sensor === 'Distance Sensor') {
            pinDefinitions.push(`const int ${constBase}_TRIG_PIN = 5;`);
            pinDefinitions.push(`const int ${constBase}_ECHO_PIN = 6;`);
            setupLines.push(`  pinMode(${constBase}_TRIG_PIN, OUTPUT);`);
            setupLines.push(`  pinMode(${constBase}_ECHO_PIN, INPUT);`);
            readLines.push(`  digitalWrite(${constBase}_TRIG_PIN, LOW);`);
            readLines.push('  delayMicroseconds(2);');
            readLines.push(`  digitalWrite(${constBase}_TRIG_PIN, HIGH);`);
            readLines.push('  delayMicroseconds(10);');
            readLines.push(`  digitalWrite(${constBase}_TRIG_PIN, LOW);`);
            readLines.push(
                `  long ${constBase.toLowerCase()}PulseUs = pulseIn(${constBase}_ECHO_PIN, HIGH, 30000);`
            );
            readLines.push(
                `  float ${constBase.toLowerCase()}DistanceCm = (${constBase.toLowerCase()}PulseUs * 0.0343f) / 2.0f;`
            );
            serialLines.push('  Serial.print("Distance (cm): ");');
            serialLines.push(`  Serial.println(${constBase.toLowerCase()}DistanceCm);`);
            alertChecks.push(
                `  if (${constBase.toLowerCase()}DistanceCm > 0 && ${constBase.toLowerCase()}DistanceCm < 20) { alert = true; }`
            );
            triggerRuleLines.push('- If distance is less than 20 cm, alert turns ON.');
            return;
        }

        if (mapping.startsWith('A')) {
            pinDefinitions.push(`const int ${constBase}_PIN = ${mapping};`);
            setupLines.push(`  pinMode(${constBase}_PIN, INPUT);`);
            readLines.push(`  int ${constBase.toLowerCase()}Value = analogRead(${constBase}_PIN);`);
            serialLines.push(`  Serial.print("${sensor}: ");`);
            serialLines.push(`  Serial.println(${constBase.toLowerCase()}Value);`);

            if (sensor === 'Moisture Sensor') {
                alertChecks.push(`  if (${constBase.toLowerCase()}Value < 400) { alert = true; }`);
                triggerRuleLines.push('- If moisture value drops below 400 (dry soil), alert turns ON.');
            } else if (sensor === 'Light Sensor') {
                alertChecks.push(`  if (${constBase.toLowerCase()}Value < 300) { alert = true; }`);
                triggerRuleLines.push('- If light value drops below 300 (dark), alert turns ON.');
            } else {
                alertChecks.push(`  if (${constBase.toLowerCase()}Value > 600) { alert = true; }`);
                triggerRuleLines.push(`- If ${sensor} reading is above 600, alert turns ON.`);
            }
            return;
        }

        const digital = digitalPinNumber(mapping);
        const pinValue = Number.isInteger(digital) ? digital : 2;
        pinDefinitions.push(`const int ${constBase}_PIN = ${pinValue};`);
        setupLines.push(`  pinMode(${constBase}_PIN, INPUT);`);
        readLines.push(`  int ${constBase.toLowerCase()}Value = digitalRead(${constBase}_PIN);`);
        serialLines.push(`  Serial.print("${sensor}: ");`);
        serialLines.push(`  Serial.println(${constBase.toLowerCase()}Value);`);
        alertChecks.push(`  if (${constBase.toLowerCase()}Value == HIGH) { alert = true; }`);
        triggerRuleLines.push(`- If ${sensor} is HIGH, alert turns ON.`);
    });

    usedOutputs.forEach((device) => {
        const mapping = OUTPUT_DEVICE_PIN_MAPPING[device] || 'D13';
        const constBase = toConstName(device);
        const digital = digitalPinNumber(mapping);
        const pinValue = Number.isInteger(digital) ? digital : 13;
        pinDefinitions.push(`const int ${constBase}_PIN = ${pinValue};`);
        setupLines.push(`  pinMode(${constBase}_PIN, OUTPUT);`);
        outputLines.push(`  digitalWrite(${constBase}_PIN, alert ? HIGH : LOW);`);
    });

    const declarationBlocks = [];
    if (includeLines.length > 0) declarationBlocks.push([...new Set(includeLines)].join('\n'));
    if (pinDefinitions.length > 0) declarationBlocks.push(pinDefinitions.join('\n'));
    if (globalObjectLines.length > 0) declarationBlocks.push(globalObjectLines.join('\n'));

    const code = `${declarationBlocks.join('\n\n')}

void setup() {
  Serial.begin(9600);
${setupLines.join('\n')}
  Serial.println("Project started. Monitoring sensors...");
}

void loop() {
${readLines.join('\n')}

${serialLines.join('\n')}

  bool alert = false;
${alertChecks.join('\n')}

${outputLines.join('\n')}

  Serial.print("Alert state: ");
  Serial.println(alert ? "ON" : "OFF");
  Serial.println("----------------------");
  delay(1000);
}`;

    const sensorUseLines = usedInputs.map(
        (sensor) => `- ${sensor}: ${sensorUseMap[sensor] || 'Used as an input signal in this project.'}`
    );
    const outputUseLines = usedOutputs.map(
        (device) => `- ${device}: ${outputUseMap[device] || 'Activates when alert condition is true.'}`
    );
    const simpleBuildSummary = [
        `- You will build a simple Arduino monitoring system using ${usedInputs.length} input sensor${usedInputs.length > 1 ? 's' : ''}.`,
        `- The board reads live sensor values and controls ${usedOutputs.length} output device${usedOutputs.length > 1 ? 's' : ''} automatically.`,
        '- Outputs turn ON when conditions are met and turn OFF when conditions return to normal.',
    ].join('\n');
    const exampleOutputLine =
        usedInputs.some(isDhtSensor) && usedOutputs.includes('Buzzer')
            ? '- Example for your selected parts: if temperature is above 40C, the buzzer turns ON and makes sound.'
            : '- Example: when a sensor condition crosses its threshold, selected outputs turn ON; otherwise they stay OFF.';

    return `1. PROJECT TITLE
Smart Sensor Starter Project

A beginner-friendly Arduino project using your selected components.
This fallback guide was generated locally so you can continue building.

2. PROJECT DESCRIPTION

This project builds an automated monitoring and alert system using your selected components.

What you will build (simple overview):
${simpleBuildSummary}

Selected sensor uses:
${sensorUseLines.join('\n')}

Selected output device uses:
${outputUseLines.join('\n')}

Alert logic used in code:
${triggerRuleLines.join('\n')}

3. EXPECTED OUTPUT

- Serial Monitor shows live sensor values and final "Alert state: ON/OFF" every second.
- Output behavior for your selected devices:
${outputUseLines.join('\n')}
- Outputs turn ON when any alert condition is true and turn OFF when no alert condition is true.
${exampleOutputLine}

4. CONNECTING THE SENSORS TO PCB

[IMAGE PLACEHOLDER]

Plug in the female connector onto the male connector on the PCB and the other end to the sensor. Similarly connect 2-pin connectors and 4-pin connectors.

Always connect:
- Positive (VCC) to Positive
- Negative (GND) to Negative

Pin Mapping:
${pinMapLines}

5. POWERING THE PCB

[IMAGE PLACEHOLDER]

Power up PCB using power adapter:
Connect one end to the box and other end to the socket.

6. CONNECT PCB TO COMPUTER

[IMAGE PLACEHOLDER]

Connect PCB to your computer using USB cable.
The USB cable allows your computer to send and receive data.

7. ARDUINO IDE SETUP

a) Tools -> Board -> Arduino/Genuino Uno
b) Tools -> Port -> COM <any number>

\`\`\`cpp
${code}
\`\`\`

8. ADD LIBRARIES

No additional libraries are required for this starter version.

9. TEST YOUR CODE

Upload the code, open Serial Monitor at 9600 baud, and verify sensor values are printing every second.

10. DISCONNECT USB CABLE FROM PCB

11. WELL DONE
`;
};

// POST /api/generate - Generate project guide
app.post('/api/generate', async (req, res) => {
    try {
        // Validate input
        const { sensors } = req.body;
        if (!sensors || !Array.isArray(sensors) || sensors.length === 0) {
            return res.status(400).json({
                error: 'sensors array is required and must contain at least one sensor',
            });
        }

        console.log('Received sensors:', sensors);

        // Separate input sensors and output devices
        const { selectedSensors, selectedOutputs } = splitKnownComponents(sensors);

        console.log('Selected sensors:', selectedSensors);
        console.log('Selected outputs:', selectedOutputs);

        if (selectedSensors.length === 0 || selectedOutputs.length === 0) {
            return res.status(400).json({
                error:
                    'Select at least one input sensor and at least one output device before generating a project guide.',
            });
        }

        const cacheKey = buildCacheKey(selectedSensors, selectedOutputs);
        const promptCache = loadPromptCache();
        const cachedEntry = promptCache.entries[cacheKey];
        if (cachedEntry && typeof cachedEntry.result === 'string' && cachedEntry.result.trim()) {
            console.log('Returning cached guide for combination:', cacheKey);
            return res.status(200).json({
                result: cachedEntry.result,
                cached: true,
                source: cachedEntry.source || 'cache',
            });
        }

        // Build selected sensors list for prompt
        const selectedSensorsText =
            selectedSensors.length > 0
                ? selectedSensors.map((s) => `- ${s} (Pin: ${SENSOR_PIN_MAPPING[s]})`).join('\n')
                : 'No input sensors selected';

        // Build selected outputs list for prompt
        const selectedOutputsText =
            selectedOutputs.length > 0
                ? selectedOutputs.map((s) => `- ${s} (Pin: ${OUTPUT_DEVICE_PIN_MAPPING[s]})`).join('\n')
                : 'No output devices selected';

        // Build the structured prompt
        const prompt = `You are an Arduino project instructor for beginners.
Create one complete, practical project guide and one complete Arduino sketch.

Selected Input Sensors:
${selectedSensorsText}

Selected Output Devices:
${selectedOutputsText}

Task rules:
- If all selected components can work together in one meaningful project, use all of them.
- If not, print this exact sentence first:
"We cannot connect all selected sensors into one meaningful project."
- Then choose a compatible subset and continue with a complete guide for that subset.
- Always use exact pin mapping from the list above.
- Keep code and explanations beginner-friendly.

Output requirements:
- Respond in markdown only.
- Do not use HTML.
- Do not use tables.
- Return exactly one complete guide.
- Return exactly one fenced code block with language tag cpp.
- The cpp block must contain one full, copy-paste-ready Arduino sketch.
- Do not output snippets, pseudocode, placeholders, TODO text, or omitted parts.
- In PROJECT DESCRIPTION, include:
  1) A simple 2-3 line beginner-friendly overview of what the user is going to build
  2) "Sensor uses" bullet list for each selected sensor
  3) "Output device uses" bullet list for each selected output device
  4) "Control logic" bullet list in IF condition -> THEN output format with numeric thresholds.
- In EXPECTED OUTPUT, include exact behavior for each selected output device.
- If final project includes Humidity & Temperature Sensor and Buzzer, include this exact line:
"If temperature is above 40C, the buzzer turns ON and makes sound."

Follow this exact section format:

1. PROJECT TITLE
[Short heading of the project]

[Small simple description - 2-3 beginner-friendly lines]

2. PROJECT DESCRIPTION

[Explain what the user is building and how it works end-to-end.
Then include:
- A simple 2-3 line beginner-friendly overview of what they are going to build.
- Sensor uses: one bullet for each selected sensor.if they didn't select an sensor , show 'no input sensor selected'
- Output device uses: one bullet for each selected output device.if they didn't select an output device , show 'no input output device  selected'
- Control logic: one bullet for each IF condition -> THEN output rule, with clear threshold values.]

3. EXPECTED OUTPUT

[Clearly explain what user should see in Serial Monitor.
Then list how each selected output behaves for each trigger condition.]

4. CONNECTING THE SENSORS TO PCB

[IMAGE PLACEHOLDER]

Below image, write:
"Plug in the female connector onto the male connector on the PCB and the other end to the sensor. Similarly connect 2-pin connectors and 4-pin connectors.

Always connect:
- Positive (VCC) to Positive
- Negative (GND) to Negative"

Pin Mapping:
[List only the sensors/outputs used in the final project with their pins]

5. POWERING THE PCB

[IMAGE PLACEHOLDER]

Power up PCB using power adapter:
Connect one end to the box and other end to the socket.

6. CONNECT PCB TO COMPUTER

[IMAGE PLACEHOLDER]

Connect PCB to your computer using USB cable.
The USB cable allows your computer to send and receive data.

7. ARDUINO IDE SETUP

a) Tools -> Board -> Arduino/Genuino Uno
b) Tools -> Port -> COM <any number>

[Generate FULL ready-to-paste Arduino code. Code must:
- Compile on Arduino Uno
- Declare explicit pin constants for every selected sensor/output
- Use only required libraries
- Include full setup() and full loop()
- Include helper functions only if needed
- Read all selected sensors used in the project
- Control all selected outputs used in the project
- Print clear Serial Monitor logs for sensor values and output state
- Keep logic simple and readable for beginners]

8. ADD LIBRARIES

[Include only necessary libraries based on the sensors used]

9. TEST YOUR CODE

[Brief testing instructions]

10. DISCONNECT USB CABLE FROM PCB

11. WELL DONE

[BACK TO HOME BUTTON]

Final check before output:
- Ensure code block is complete and compilable.
- Ensure every used component appears in pin mapping and code.

Generate the final guide now.`;

        const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : '';
        if (!apiKey) {
            console.warn('OPENAI_API_KEY missing. Returning local fallback guide.');
            const fallbackResult = buildFallbackGuide(selectedSensors, selectedOutputs);
            cacheGuideResult(cacheKey, selectedSensors, selectedOutputs, fallbackResult, 'fallback');
            return res.status(200).json({
                result: fallbackResult,
                fallback: true,
                cached: false,
                note: 'Generated without OpenAI because OPENAI_API_KEY is missing.',
            });
        }

        // Initialize OpenAI client
        console.log('Initializing OpenAI API...');
        const client = new OpenAI({
            apiKey,
        });

        // Call OpenAI API
        console.log('Calling OpenAI API...');
        const response = await client.chat.completions.create({
            model: MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
        });

        // Extract text from response
        const responseText = response.choices[0].message.content;

        console.log('Successfully generated project guide');

        // Return the generated content
        cacheGuideResult(cacheKey, selectedSensors, selectedOutputs, responseText, 'openai');
        return res.status(200).json({
            result: responseText,
            cached: false,
        });
    } catch (error) {
        console.error('API Error:', error);
        const status = error && typeof error === 'object' ? error.status : undefined;
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';

        // Handle specific error types
        if (status === 401 || message.includes('API key') || message.includes('401')) {
            console.warn('OpenAI auth failed. Returning local fallback guide.');
            const { selectedSensors: fallbackSensors, selectedOutputs: fallbackOutputs } = splitKnownComponents(
                req.body?.sensors
            );
            const fallbackResult = buildFallbackGuide(fallbackSensors, fallbackOutputs);
            cacheGuideResult(
                buildCacheKey(fallbackSensors, fallbackOutputs),
                fallbackSensors,
                fallbackOutputs,
                fallbackResult,
                'fallback-auth'
            );
            return res.status(200).json({
                result: fallbackResult,
                fallback: true,
                note: 'Generated without OpenAI because API authentication failed.',
            });
        }

        if (
            status === 429 ||
            message.toLowerCase().includes('quota') ||
            message.toLowerCase().includes('rate') ||
            message.includes('429')
        ) {
            console.warn('OpenAI rate/quota issue. Returning local fallback guide.');
            const { selectedSensors: fallbackSensors, selectedOutputs: fallbackOutputs } = splitKnownComponents(
                req.body?.sensors
            );
            const fallbackResult = buildFallbackGuide(fallbackSensors, fallbackOutputs);
            cacheGuideResult(
                buildCacheKey(fallbackSensors, fallbackOutputs),
                fallbackSensors,
                fallbackOutputs,
                fallbackResult,
                'fallback-rate-limit'
            );
            return res.status(200).json({
                result: fallbackResult,
                fallback: true,
                note: 'Generated without OpenAI because API quota/rate limits were reached.',
            });
        }

        if (status === 404 || message.toLowerCase().includes('model')) {
            return res.status(400).json({
                error: `Model configuration error. Check OPENAI_MODEL (current: ${MODEL}).`,
            });
        }

        return res.status(status && Number.isInteger(status) ? status : 500).json({
            error: `Failed to generate project guide: ${message}`,
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: POST http://localhost:${PORT}/api/generate`);
});
