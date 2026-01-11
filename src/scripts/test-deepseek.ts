// Test script to verify DeepSeek API connection
// Run with: npx ts-node --esm src/scripts/test-deepseek.ts
// Or: npx tsx src/scripts/test-deepseek.ts

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

async function testDeepSeekAPI() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  console.log("\n🔍 Testing DeepSeek API Connection...\n");
  console.log(`API Key: ${apiKey ? apiKey.slice(0, 10) + "..." + apiKey.slice(-4) : "NOT SET"}`);
  console.log(`Key format check: ${apiKey?.startsWith("sk-") ? "✓ Looks correct" : "⚠️ Should start with 'sk-'"}\n`);

  if (!apiKey) {
    console.error("❌ DEEPSEEK_API_KEY is not set in .env.local");
    process.exit(1);
  }

  try {
    console.log("Sending test request...\n");
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: "Say 'API connection successful' in exactly 3 words." },
        ],
        temperature: 0.1,
        max_tokens: 20,
      }),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n❌ API Error Response:");
      console.error(errorText);
      
      if (response.status === 401) {
        console.error("\n⚠️  Authentication failed. Your API key is invalid.");
        console.error("   Get a valid key from: https://platform.deepseek.com/api_keys");
      }
      process.exit(1);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("\n✅ DeepSeek API is working!");
    console.log(`Response: "${content}"`);
    console.log(`\nModel: ${data.model}`);
    console.log(`Tokens used: ${data.usage?.total_tokens || "unknown"}`);

  } catch (error) {
    console.error("\n❌ Connection Error:");
    console.error(error);
    process.exit(1);
  }
}

testDeepSeekAPI();
