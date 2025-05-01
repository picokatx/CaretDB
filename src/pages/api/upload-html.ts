import type { APIRoute } from 'astro';
import * as crypto from 'node:crypto';
import { sql } from '../../lib/mysql-connect';
import { sqlQueries } from '../../lib/sql_query_locale';
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
    
    // Calculate SHA256 hash of the file content
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
    
    // Use hash as the filename
    const fileName = `${hash}.html`;
    
    // Define the path where the file will be saved
    const publicDir = path.resolve(process.cwd(), 'public', 'dom');
    const filePath = path.join(publicDir, fileName);
    
    // Make sure the directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Define the script tags to inject
    const cdnScriptTag = '<script src="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js"></script>';
    const loaderScriptTag = '<script src="/dom/rrweb_loader.js"></script>';

    let tempModifiedContent = fileContent;

    // --- Inject CDN Script into <head> --- 
    const headEndTag = '</head>';
    const headStartTag = '<head>';
    if (tempModifiedContent.includes(headEndTag)) {
      tempModifiedContent = tempModifiedContent.replace(headEndTag, `  ${cdnScriptTag}\n${headEndTag}`);
    } else if (tempModifiedContent.includes(headStartTag)) {
       // Inject after the opening tag if closing tag not found
       tempModifiedContent = tempModifiedContent.replace(headStartTag, `${headStartTag}\n  ${cdnScriptTag}`);
    } else {
        // Prepend if no head tag found (fallback)
        tempModifiedContent = cdnScriptTag + '\n' + tempModifiedContent;
    }

    // --- Inject rrweb_loader.js before </body> or </html> (using the content modified above) ---
    let finalModifiedContent = tempModifiedContent; // Start with content that includes CDN script
    const bodyEndTag = '</body>';
    const htmlEndTag = '</html>';

    if (finalModifiedContent.includes(bodyEndTag)) {
      finalModifiedContent = finalModifiedContent.replace(bodyEndTag, `  ${loaderScriptTag}\n${bodyEndTag}`);
    } else if (finalModifiedContent.includes(htmlEndTag)) {
      finalModifiedContent = finalModifiedContent.replace(htmlEndTag, `  ${loaderScriptTag}\n${htmlEndTag}`);
    } else {
      // Append if neither closing tag is found
      finalModifiedContent += '\n' + loaderScriptTag;
    }
    
    // Attempt to insert hash into the database, ignoring duplicates
    try {
        // The INSERT query needs to include the user email fields now
        // TODO: Get user email from session
        // For now, this insert will likely fail or insert NULLs if not handled
        // It needs the email_domain and email_name of the logged-in user.
        // This requires getting the session within the API route.
        
        // TEMPORARY: Placeholder - this needs the actual user email
        const email_domain_placeholder = 'example.com'; // Replace with actual session data
        const email_name_placeholder = 'user';       // Replace with actual session data

        await sql.query(sqlQueries.insertWebstateHash, [hash, email_domain_placeholder, email_name_placeholder]);
    } catch (dbError: any) { // code errno sql sqlState sqlMessage message
      // Handle database errors other than duplicate entry if necessary
      console.error('Database insert error:', dbError);
      if (dbError.code === 'ER_DUP_ENTRY') {
        return new Response(
          JSON.stringify({ success: false, error: 'Duplicate entry' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update database: ' + dbError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    fs.writeFileSync(filePath, finalModifiedContent);
    
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