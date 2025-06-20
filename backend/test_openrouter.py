#!/usr/bin/env python3

import os
import httpx
import asyncio
import json
from dotenv import load_dotenv

load_dotenv()

async def test_openrouter():
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not api_key:
        print("No API key found")
        return
    
    print(f"API key starts with: {api_key[:10]}...")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "GenAI RAG Chatbot"
    }
     # Try different models
    models_to_try = [
        "nousresearch/nous-capybara-7b:free",
        "openai/gpt-3.5-turbo",
        "google/gemma-7b-it:free"
    ]
    
    for model in models_to_try:
        print(f"\nTrying model: {model}")
        
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Hello"}
            ],
            "max_tokens": 50
        }
        
        try:
            async with httpx.AsyncClient() as client:
                print("Making API call...")
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=10.0
                )
                
                print(f"Status code: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"Error response: {response.text}")
                    continue
                else:
                    result = response.json()
                    print(f"Success with {model}: {result}")
                    break  # Stop on first success
                    
        except Exception as e:
            print(f"Exception with {model}: {e}")
            continue

if __name__ == "__main__":
    asyncio.run(test_openrouter())
