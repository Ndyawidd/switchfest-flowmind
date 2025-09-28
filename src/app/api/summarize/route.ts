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
        summary: "Teks terlalu pendek untuk diringkas." 
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured.' 
      }, { status: 500 });
    }

    // Gemini bisa handle text yang lebih panjang
    const maxLength = 12000;
    const inputText = cleanedText.length > maxLength 
      ? cleanedText.substring(0, maxLength) + "..."
      : cleanedText;

    const prompt = `Buatlah ringkasan yang padat dan informatif dari teks berikut dalam bahasa Indonesia. 
Ringkasan harus:
- Terdiri dari 2-4 kalimat
- Mencakup poin-poin utama
- Jelas dan mudah dipahami
- Dalam bahasa Indonesia

Teks yang akan diringkas:
${inputText}

Ringkasan:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      
      if (response.status === 400) {
        return NextResponse.json({ 
          error: 'Invalid request to Gemini API. Please check your API key.' 
        }, { status: 400 });
      }
      
      if (response.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }, { status: 429 });
      }
      
      return NextResponse.json({ 
        error: `Gemini API error: ${errorData.error?.message || 'Unknown error'}` 
      }, { status: response.status });
    }

    const result = await response.json();
    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!summary) {
      console.error('Unexpected Gemini response:', result);
      return NextResponse.json({ 
        error: 'Failed to generate summary from Gemini.' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      summary,
      metadata: {
        originalLength: cleanedText.length,
        summaryLength: summary.length,
        truncated: cleanedText.length > maxLength,
        provider: 'Google Gemini (Free)'
      }
    });

  } catch (error) {
    console.error('Error summarizing text:', error);
    return NextResponse.json({ 
      error: 'Internal server error while processing summary.' 
    }, { status: 500 });
  }
}



// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   try {
//     const { text } = await req.json();

//     if (!text || text.trim().length === 0) {
//       return NextResponse.json({ error: 'Text is required' }, { status: 400 });
//     }

//     const cleanedText = text.trim();
    
//     if (cleanedText.length < 100) {
//       return NextResponse.json({ 
//         summary: "Teks terlalu pendek untuk diringkas." 
//       });
//     }

//     const huggingFaceToken = process.env.HUGGING_FACE_API_TOKEN;

//     if (!huggingFaceToken) {
//       return NextResponse.json({ 
//         error: 'Hugging Face API token not configured.' 
//       }, { status: 500 });
//     }

//     // Coba beberapa model secara berurutan jika yang pertama gagal
//     const models = [
//       "facebook/bart-large-cnn",           // Bagus untuk summarization umum
//       "sshleifer/distilbart-xsum-12-6",    // Lebih cepat, hasil bagus
//       "microsoft/DialoGPT-medium",         // Fallback
//       "cahya/bert2bert-indonesian-summarization" // Khusus Indonesia (jika tersedia)
//     ];

//     let summary = null;
//     let usedModel = null;

//     // Batasi panjang input
//     const maxLength = 2500;
//     const inputText = cleanedText.length > maxLength 
//       ? cleanedText.substring(0, maxLength) + "..."
//       : cleanedText;

//     for (const model of models) {
//       try {
//         console.log(`Trying model: ${model}`);
        
//         const response = await fetch(
//           `https://api-inference.huggingface.co/models/${model}`,
//           {
//             headers: {
//               'Authorization': `Bearer ${huggingFaceToken}`,
//               'Content-Type': 'application/json',
//             },
//             method: 'POST',
//             body: JSON.stringify({ 
//               inputs: inputText,
//               parameters: {
//                 max_length: 150,
//                 min_length: 30,
//                 do_sample: false,
//                 early_stopping: true
//               },
//               options: {
//                 wait_for_model: true // Wait jika model sedang loading
//               }
//             }),
//           }
//         );

//         if (response.ok) {
//           const result = await response.json();
          
//           // Handle different response formats
//           if (Array.isArray(result) && result[0]?.summary_text) {
//             summary = result[0].summary_text.trim();
//             usedModel = model;
//             break;
//           } else if (result.summary_text) {
//             summary = result.summary_text.trim();
//             usedModel = model;
//             break;
//           } else if (Array.isArray(result) && result[0]?.generated_text) {
//             summary = result[0].generated_text.trim();
//             usedModel = model;
//             break;
//           }
//         } else {
//           const errorData = await response.json();
//           console.log(`Model ${model} failed:`, errorData);
          
//           // Jika model sedang loading, tunggu sebentar
//           if (response.status === 503) {
//             await new Promise(resolve => setTimeout(resolve, 2000));
//           }
          
//           continue; // Try next model
//         }
//       } catch (error) {
//         console.log(`Model ${model} error:`, error);
//         continue; // Try next model
//       }
//     }

//     if (!summary) {
//       return NextResponse.json({ 
//         error: 'All summarization models failed. Please try again later.' 
//       }, { status: 500 });
//     }

//     // Clean up summary
//     summary = summary
//       .replace(/^(Summary:|Ringkasan:|TL;DR:)/i, '') // Remove prefixes
//       .trim();

//     return NextResponse.json({ 
//       summary,
//       metadata: {
//         originalLength: cleanedText.length,
//         summaryLength: summary.length,
//         truncated: cleanedText.length > maxLength,
//         provider: `Hugging Face (${usedModel})`,
//         modelUsed: usedModel
//       }
//     });

//   } catch (error) {
//     console.error('Error summarizing text:', error);
//     return NextResponse.json({ 
//       error: 'Internal server error while processing summary.' 
//     }, { status: 500 });
//   }
// }