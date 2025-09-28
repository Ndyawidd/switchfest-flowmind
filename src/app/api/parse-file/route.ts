// src/app/api/parse-file/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('Parse file API called');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    console.log('Processing file:', fileName, 'Type:', fileType, 'Size:', file.size);

    let extractedText = '';

    try {
      // Handle TXT files first (simplest)
      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        console.log('Parsing TXT...');
        extractedText = buffer.toString('utf-8');
      }
      
      // Handle PDF files
      else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        console.log('Parsing PDF...');
        try {
          // Dynamic import for pdf-parse
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData.text;
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          return NextResponse.json({
            error: 'Failed to parse PDF. Please make sure the PDF is not password protected and contains extractable text.'
          }, { status: 500 });
        }
      }
      
      // Handle DOC/DOCX files
      else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'application/msword' ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.doc')
      ) {
        console.log('Parsing DOCX/DOC...');
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        } catch (docError) {
          console.error('DOC parsing error:', docError);
          return NextResponse.json({
            error: 'Failed to parse document. Please ensure the document is not corrupted.'
          }, { status: 500 });
        }
      }
      
      // Handle PPTX files
      else if (
        fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        fileName.endsWith('.pptx')
      ) {
        console.log('Parsing PPTX...');
        try {
          extractedText = await extractPPTXText(buffer);
        } catch (pptxError) {
          console.error('PPTX parsing error:', pptxError);
          return NextResponse.json({
            error: 'Failed to parse PowerPoint file. Please ensure the file is not corrupted.'
          }, { status: 500 });
        }
      }
      
      else {
        return NextResponse.json({
          error: `Unsupported file type: ${fileType}. Supported formats: PDF, DOC, DOCX, PPTX, TXT`
        }, { status: 400 });
      }

      // Clean up extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
        .trim();

      if (!extractedText || extractedText.length < 5) {
        return NextResponse.json({
          error: 'Could not extract meaningful text from the file. The file might be empty, corrupted, or contain only images/graphics.'
        }, { status: 400 });
      }

      console.log('Successfully extracted text, length:', extractedText.length);

      return NextResponse.json({
        success: true,
        text: extractedText,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: fileType,
          textLength: extractedText.length,
          wordCount: extractedText.split(/\s+/).filter(word => word.length > 0).length
        }
      });

    } catch (parseError: any) {
      console.error('Error parsing file:', parseError);
      return NextResponse.json({
        error: `Failed to parse ${fileName}: ${parseError.message}`
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('File processing error:', error);
    return NextResponse.json({
      error: 'Internal server error while processing file'
    }, { status: 500 });
  }
}

// Simple PPTX text extraction
async function extractPPTXText(buffer: Buffer): Promise<string> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    
    let extractedText = '';
    const slideFiles = Object.keys(zip.files).filter(name => 
      name.includes('ppt/slides/slide') && name.endsWith('.xml')
    );

    for (const slideFile of slideFiles) {
      const slideXml = await zip.files[slideFile].async('text');
      
      // Extract text from various XML elements in PPTX
      const textMatches = slideXml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) || [];
      textMatches.forEach(match => {
        const text = match.replace(/<a:t[^>]*>([^<]*)<\/a:t>/, '$1');
        if (text.trim()) {
          extractedText += text.trim() + ' ';
        }
      });
      
      // Also try to extract from p:txBody elements
      const bodyMatches = slideXml.match(/<p:txBody[^>]*>([\s\S]*?)<\/p:txBody>/g) || [];
      bodyMatches.forEach(match => {
        const innerText = match.replace(/<[^>]*>/g, '').trim();
        if (innerText && innerText.length > 2) {
          extractedText += innerText + ' ';
        }
      });
    }

    return extractedText.trim();
  } catch (error: any) {
    console.error('PPTX parsing error:', error);
    throw new Error(`Failed to parse PPTX file: ${error.message}`);
  }
}