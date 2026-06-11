// Minimal Gemini API diagnostic — run with: node test-gemini.js
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
console.log('--- Gemini Diagnostic ---');
console.log('Node version:', process.version);
console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');

// Check SDK version
try {
    const pkgPath = require.resolve('@google/generative-ai/package.json');
    const pkg = require(pkgPath);
    console.log('SDK version:', pkg.version);
} catch (e) {
    console.log('SDK version: unable to read');
}

// Check the DEFAULT_BASE_URL from the compiled SDK
try {
    const sdkSrc = require('fs').readFileSync(
        require.resolve('@google/generative-ai/dist/index.js'), 'utf8'
    );
    const match = sdkSrc.match(/DEFAULT_BASE_URL\s*=\s*"([^"]+)"/);
    console.log('SDK base URL:', match ? match[1] : 'NOT FOUND');
} catch (e) {
    console.log('SDK base URL check failed:', e.message);
}

console.log('\n--- Testing API call ---');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Test with gemini-1.5-flash
        console.log('Model: gemini-1.5-flash');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Say hello in one word.');
        const response = await result.response;
        const text = response.text();
        console.log('✅ SUCCESS! Response:', text);
    } catch (error) {
        console.error('❌ FAILED:', error.message);

        // Extract URL from error if present
        const urlMatch = error.message.match(/https?:\/\/[^\s:]+/);
        if (urlMatch) {
            console.log('\n--- URL Analysis ---');
            console.log('URL from error:', urlMatch[0]);

            // Check for the "gg" typo
            if (urlMatch[0].includes('languagge')) {
                console.log('🚨 CONFIRMED: URL contains "languagge" (double g)');
                console.log('This is NOT from the SDK (SDK source is correct).');
                console.log('Possible causes:');
                console.log('  1. DNS redirect/ISP interference');
                console.log('  2. Browser extension or proxy');
                console.log('  3. Antivirus/firewall URL rewriting');
                console.log('  4. Windows hosts file redirect');
            }
        }

        // If it's a 404, check if model name is the issue
        if (error.message.includes('404') || error.message.includes('not found')) {
            console.log('\n--- Model Availability ---');
            console.log('The model may not be available for your API key.');
            console.log('Try: gemini-2.0-flash or gemini-1.5-flash');
        }
    }
}

test();
