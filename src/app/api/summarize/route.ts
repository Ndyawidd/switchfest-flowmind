// src/app/api/summarize/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanedText = text.trim();
    
    if (cleanedText.length < 100) {
      return NextResponse.json({ 
        summary: "Teks terlalu pendek untuk diringkas. Minimal 100 karakter diperlukan." 
      });
    }

    // Check API key
    const geminiApiKey = process.env.GEMINI_API_TOKEN;

    if (!geminiApiKey) {
      console.error('GEMINI_API_TOKEN not found in environment variables');
      return NextResponse.json({ 
        error: 'Gemini API key not configured. Please set GEMINI_API_TOKEN in .env.local file.' 
      }, { status: 500 });
    }

    // Gemini 2.5 Flash dapat handle text yang sangat panjang (1M tokens)
    const maxLength = 50000; // Lebih besar karena model lebih powerful
    const inputText = cleanedText.length > maxLength 
      ? cleanedText.substring(0, maxLength) + "..."
      : cleanedText;

    const prompt = `Buatlah ringkasan yang padat dan informatif dari teks berikut dalam bahasa Indonesia. 
Ringkasan harus:
- Terdiri dari 3-5 paragraf
- Mencakup semua poin-poin utama
- Jelas dan mudah dipahami
- Dalam bahasa Indonesia yang baik dan benar

Teks yang akan diringkas:
${inputText}

Ringkasan:`;

    console.log('Sending request to Gemini API...');
    console.log('Text length:', inputText.length);

    // Use Gemini 2.5 Flash - Latest and fastest model
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Naikkan dari 1000 ke 2048
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('Gemini API Error:', errorData);
      
      if (response.status === 400) {
        return NextResponse.json({ 
          error: 'Invalid request to Gemini API. Please check your API key and try again.' 
        }, { status: 400 });
      }
      
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again in a few moments.' 
        }, { status: 429 });
      }

      if (response.status === 403) {
        return NextResponse.json({ 
          error: 'API key is invalid or not authorized. Please check your GEMINI_API_TOKEN.' 
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: `Gemini API error: ${errorData.error?.message || 'Unknown error'}` 
      }, { status: response.status });
    }

    const result = await response.json();
    console.log('Gemini API response:', JSON.stringify(result, null, 2));

    // Check finish reason first
    const candidate = result.candidates?.[0];
    const finishReason = candidate?.finishReason;

    console.log('Finish reason:', finishReason);

    // Handle MAX_TOKENS - return partial result
    if (finishReason === 'MAX_TOKENS') {
      const partialSummary = candidate?.content?.parts?.[0]?.text?.trim();
      if (partialSummary) {
        console.log('Partial summary due to MAX_TOKENS, length:', partialSummary.length);
        return NextResponse.json({ 
          summary: partialSummary + '\n\n[Catatan: Ringkasan mungkin terpotong karena teks sangat panjang. Coba dengan teks yang lebih pendek untuk hasil optimal.]',
          metadata: {
            originalLength: cleanedText.length,
            summaryLength: partialSummary.length,
            truncated: true,
            provider: 'Google Gemini 2.5 Flash',
            warning: 'Output truncated due to token limit'
          }
        });
      }
    }

    const summary = candidate?.content?.parts?.[0]?.text?.trim();

    if (!summary) {
      console.error('No summary text in response:', result);
      
      // Check if content was blocked
      if (result.candidates?.[0]?.finishReason === 'SAFETY') {
        return NextResponse.json({ 
          error: 'Content was blocked by safety filters. Please try with different text.' 
        }, { status: 400 });
      }

      return NextResponse.json({ 
        error: 'Failed to generate summary. The API returned an unexpected response.' 
      }, { status: 500 });
    }

    console.log('Summary generated successfully, length:', summary.length);

    return NextResponse.json({ 
      summary,
      metadata: {
        originalLength: cleanedText.length,
        summaryLength: summary.length,
        truncated: cleanedText.length > maxLength,
        provider: 'Google Gemini 2.5 Flash'
      }
    });

  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error summarizing text:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  } else {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error: Unknown error' }, { status: 500 });
  }
}
}