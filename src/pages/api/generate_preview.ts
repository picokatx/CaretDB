import type { APIRoute } from "astro";
import { chromium } from "@playwright/test";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// Helper function to ensure directory exists
async function ensureDirExists(dirPath: string) {
    try {
        await fs.access(dirPath);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dirPath, { recursive: true });
        } else {
            throw error;
        }
    }
}

export const POST: APIRoute = async ({ request }) => {
    let params;
    try {
        params = await request.json();
        const htmlHash = params?.html_hash;
        console.log(`[Preview API] Received request for hash: ${htmlHash}`); // Log received hash

        if (!htmlHash || typeof htmlHash !== 'string' || !/^[a-f0-9]{64}$/.test(htmlHash)) {
            console.error('[Preview API] Invalid hash received.');
            return new Response(JSON.stringify({ success: false, error: "Invalid or missing html_hash parameter." }), { status: 400 });
        }

        // Construct paths
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const projectRoot = path.resolve(__dirname, '../../../'); 
        const previewDir = path.join(projectRoot, 'public', 'dom', 'preview');
        const previewPath = path.join(previewDir, `${htmlHash}.png`);
        const pageUrl = `${new URL(request.url).origin}/dom/${htmlHash}.html`;
        console.log(`[Preview API] Project Root: ${projectRoot}`); // Log path
        console.log(`[Preview API] Preview Dir: ${previewDir}`);   // Log path
        console.log(`[Preview API] Preview Path: ${previewPath}`); // Log path
        console.log(`[Preview API] Page URL: ${pageUrl}`);       // Log URL

        // 1. Ensure preview directory exists
        await ensureDirExists(previewDir);

        // 2. Check if preview already exists
        try {
            await fs.access(previewPath);
            console.log(`[Preview API] Preview already exists for ${htmlHash}`);
            return new Response(JSON.stringify({ success: true, message: "Preview already exists." }), { status: 200 });
        } catch {
            console.log(`[Preview API] Preview doesn't exist, proceeding to generate for ${htmlHash}`);
        }

        // 3. Launch Playwright and generate preview
        let browser = null;
        try {
            console.log(`[Preview API] Launching browser...`);
            browser = await chromium.launch();
            console.log(`[Preview API] Browser launched. Opening new page...`);
            const page = await browser.newPage();
            
            await page.setViewportSize({ width: 800, height: 600 }); 
            console.log(`[Preview API] Navigating to ${pageUrl}...`);
            await page.goto(pageUrl, { waitUntil: 'networkidle' }); 
            console.log(`[Preview API] Navigation complete. Taking screenshot...`);
            await page.screenshot({ path: previewPath, fullPage: false }); 
            console.log(`[Preview API] Screenshot saved to ${previewPath}. Closing browser...`);
            await browser.close();
            console.log(`[Preview API] Browser closed.`);

            console.log(`[Preview API] Successfully generated preview for ${htmlHash}`);
            return new Response(JSON.stringify({ success: true, message: "Preview generated successfully." }), { status: 200 });

        } catch (error: any) {
            console.error(`[Preview API] Error during Playwright generation for ${htmlHash}:`, error);
            if (browser) {
                await browser.close();
            }
             try { await fs.unlink(previewPath); } catch {} 
            return new Response(JSON.stringify({ success: false, error: `Failed to generate preview: ${error.message}` }), { status: 500 });

        }

    } catch (error: any) {
        console.error("[Preview API] Error processing request:", error);
        return new Response(JSON.stringify({ success: false, error: "Invalid request body or server error." }), { status: 400 });
    }
}; 