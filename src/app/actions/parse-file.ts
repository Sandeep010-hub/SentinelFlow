"use server";

import mammoth from "mammoth";

// Polyfill DOMMatrix for pdf-parse (pdf.js dependency) if missing in Node environment
if (typeof Promise.withResolvers === "undefined") {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

export async function parseFile(formData: FormData): Promise<{ text: string; error?: string }> {
    // Polyfill DOMMatrix for pdf-parse which might require it
    if (typeof global.DOMMatrix === 'undefined') {
        // @ts-ignore
        global.DOMMatrix = class DOMMatrix {
            constructor() { return this; }
            // Add minimal methods if needed, mostly it's just checked for existence
            toString() { return "[object DOMMatrix]"; }
        };
    }

    const pdf = require("pdf-parse"); // Lazy load to ensure polyfill is present
    const file = formData.get("file") as File;

    if (!file) {
        return { text: "", error: "No file uploaded" };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        if (file.type === "application/pdf") {
            const { PDFParse } = pdf;
            if (!PDFParse) {
                // Fallback if it is a default export function after all, but previous log said it's object
                throw new Error("PDFParse export not found.");
            }

            // Check if it's a class or function
            // The log showed keys: ..., PDFParse, ...
            const instance = new PDFParse(buffer);
            const text = await instance.getText();
            return { text: text || "" };
        }
        else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ buffer });
            return { text: result.value };
        }
        else {
            return { text: "", error: "Unsupported file type. Please upload PDF or DOCX." };
        }
    } catch (error: any) {
        console.error("File parsing error:", error);
        return { text: "", error: `Failed to parse file content: ${error.message || error}` };
    }
}
