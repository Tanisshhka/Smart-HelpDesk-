import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function testFinal() {
  try {
    const key = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(key);
    
    console.log("Testing with Gemini 3.1 Pro Preview...");
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
    const result = await model.generateContent("Hello from 2026!");
    console.log("Success! Response:", result.response.text());
  } catch (error) {
    console.log("Test failed:", error.message);
  }
}

testFinal();
