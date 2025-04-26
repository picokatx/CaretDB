import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the form data
    const formData = await request.formData();
    const htmlFile = formData.get('html') as File;
    
    if (!htmlFile || !htmlFile.name.endsWith('.html')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file. Must be HTML.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read the file content
    const fileContent = await htmlFile.text();
    
    // Generate a unique ID for the file
    const uuid = uuidv4();
    const fileName = `${uuid}.html`;
    
    // Define the path where the file will be saved
    const publicDir = path.resolve(process.cwd(), 'public', 'dom');
    const filePath = path.join(publicDir, fileName);
    
    // Make sure the directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Inject the rrweb_loader.js script before the closing body tag
    let modifiedContent = fileContent;
    
    // Check if the file has a body tag
    if (fileContent.includes('</body>')) {
      modifiedContent = fileContent.replace(
        '</body>', 
        '<script src="/dom/rrweb_loader.js"></script></body>'
      );
    } 
    // If no body tag, try to inject before closing html tag
    else if (fileContent.includes('</html>')) {
      modifiedContent = fileContent.replace(
        '</html>', 
        '<script src="/dom/rrweb_loader.js"></script></html>'
      );
    }
    // If neither is found, append at the end
    else {
      modifiedContent = fileContent + '\n<script src="/dom/rrweb_loader.js"></script>';
    }
    
    // Save the modified file
    fs.writeFileSync(filePath, modifiedContent);
    
    // Return success response with the file URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        fileName: fileName,
        url: `/dom/${fileName}`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to process upload' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 