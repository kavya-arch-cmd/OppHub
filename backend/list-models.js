require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('❌ GEMINI_API_KEY is missing or invalid in your .env file.');
    process.exit(1);
}

console.log('--- Fetching Available Gemini Models ---');

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`❌ API Request Failed with Status Code: ${res.statusCode}`);
            try {
                const errorJson = JSON.parse(data);
                console.error('Error Details:', JSON.stringify(errorJson, null, 2));
            } catch (e) {
                console.error('Raw Error Response:', data);
            }
            return;
        }

        try {
            const json = JSON.parse(data);
            const models = json.models || [];

            if (models.length === 0) {
                console.log('⚠️ No models found for this API key.');
                return;
            }

            console.log(`✅ Found ${models.length} available models:\n`);

            models.forEach(model => {
                console.log(`📌 Model Name: ${model.name.replace('models/', '')}`);
                console.log(`   Display Name: ${model.displayName}`);
                console.log(`   Version: ${model.version}`);
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.length > 0) {
                    console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
                }
                console.log('--------------------------------------------------');
            });
            
            console.log('\n💡 Tip: Use one of the names above (e.g., "gemini-1.5-flash") in your aiService.js GEMINI_MODEL variable.');

        } catch (e) {
            console.error('❌ Failed to parse API response:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Network request failed: ${e.message}`);
});

req.end();
