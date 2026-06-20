import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60; // 60s timeout for Vercel functions

const PROMPT_TEMPLATE = `
You are an expert Principal UI/UX Architect, WCAG 2.1 AA Accessibility Specialist, and conversion optimization copywriter.
Analyze this website screenshot. Perform a deep, professional evaluation of the interface across these aspects:
1. User Experience (UX): layout structure, navigation clarity, form design, visual noise.
2. User Interface (UI) & Visual Hierarchy: grid alignment, whitespace, typography scaling, color contrast.
3. WCAG Accessibility: color contrast of text elements, font readability, outline styling.
4. Conversion & CTA: placement of primary and secondary CTAs, visibility of key actions, fold placements.
5. Trust Signals: social proof, reviews, testimonials, security elements.
6. Mobile Friendliness: responsiveness, touch target layouts, fluid grids.

Your report must be highly detailed and return a structured JSON document.
Crucially, locate exactly 3 to 6 key visual bugs/issues in the layout and provide their precise (X, Y) pixel offset coordinates as percentages (0.0 to 100.0) from the top-left corner of the image.
These coordinates will be plotted as Figma-style markers overlaying the screenshot. 
Make sure you analyze the image and point to the actual visual locations of the items you flag (e.g. if the CTA is in the header, x=80, y=5; if it's the main button, x=50, y=40, etc.).

Return the response in this exact JSON schema:
{
  "overallScore": number (0 to 100),
  "uxScore": number (0 to 100),
  "accessibilityScore": number (0 to 100),
  "designScore": number (0 to 100),
  "conversionScore": number (0 to 100),
  "typographyScore": number (0 to 100),
  "mobileScore": number (0 to 100),
  "trustScore": number (0 to 100),
  "executiveSummary": "detailed multi-paragraph assessment of the visual layout's strengths, weaknesses, and primary targets for conversion improvement",
  "issues": [
    {
      "category": "ux" | "ui" | "accessibility" | "conversion" | "visual_hierarchy" | "typography" | "cta",
      "severity": "critical" | "warning" | "info",
      "title": "short descriptive title of the issue",
      "description": "detailed technical explanation of why this layout pattern is sub-optimal",
      "recommendation": "clear actionable prescription to resolve the issue",
      "x_percent": number (0.0 to 100.0, the visual location X coordinate),
      "y_percent": number (0.0 to 100.0, the visual location Y coordinate)
    }
  ],
  "recommendations": [
    {
      "title": "short title of high-level optimization recommendation",
      "description": "explanation of what changes should be deployed to improve the product",
      "impact": "high" | "medium" | "low",
      "effort": "high" | "medium" | "low",
      "category": "UX/UI Structure" | "Accessibility" | "Typography" | "Conversion Rate" | "Performance"
    }
  ]
}

DO NOT include any markdown code blocks or additional texts around the JSON. Return only the raw JSON.
`;
const AUDIT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    overallScore: { type: "INTEGER" },
    uxScore: { type: "INTEGER" },
    accessibilityScore: { type: "INTEGER" },
    designScore: { type: "INTEGER" },
    conversionScore: { type: "INTEGER" },
    typographyScore: { type: "INTEGER" },
    mobileScore: { type: "INTEGER" },
    trustScore: { type: "INTEGER" },
    executiveSummary: { type: "STRING" },
    issues: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { 
            type: "STRING", 
            enum: ["ux", "ui", "accessibility", "conversion", "visual_hierarchy", "typography", "cta"] 
          },
          severity: { 
            type: "STRING", 
            enum: ["critical", "warning", "info"] 
          },
          title: { type: "STRING" },
          description: { type: "STRING" },
          recommendation: { type: "STRING" },
          x_percent: { type: "NUMBER" },
          y_percent: { type: "NUMBER" }
        },
        required: ["category", "severity", "title", "description", "recommendation", "x_percent", "y_percent"]
      }
    },
    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          description: { type: "STRING" },
          impact: { 
            type: "STRING", 
            enum: ["high", "medium", "low"] 
          },
          effort: { 
            type: "STRING", 
            enum: ["high", "medium", "low"] 
          },
          category: { type: "STRING" }
        },
        required: ["title", "description", "impact", "effort", "category"]
      }
    }
  },
  required: [
    "overallScore", "uxScore", "accessibilityScore", "designScore", 
    "conversionScore", "typographyScore", "mobileScore", "trustScore", 
    "executiveSummary", "issues", "recommendations"
  ]
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, screenshotBase64, overrideApiKey } = body;

    if (!screenshotBase64) {
      return NextResponse.json({ error: "Missing screenshot image data." }, { status: 400 });
    }

    // Determine API Key
    const apiKey = overrideApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables or settings overrides." },
        { status: 400 }
      );
    }

    // Live Gemini Vision API execution
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: AUDIT_RESPONSE_SCHEMA as any,
        },
      });

      let base64Data = "";
      let mimeType = "image/png";

      if (screenshotBase64.startsWith("http://") || screenshotBase64.startsWith("https://")) {
        const imageRes = await fetch(screenshotBase64);
        if (!imageRes.ok) {
          throw new Error(`Failed to fetch screenshot from storage URL: ${screenshotBase64}`);
        }
        const arrayBuffer = await imageRes.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString("base64");
        
        const contentType = imageRes.headers.get("content-type");
        if (contentType) {
          mimeType = contentType;
        }
      } else {
        base64Data = screenshotBase64.includes(",")
          ? screenshotBase64.split(",")[1]
          : screenshotBase64;
        
        mimeType = screenshotBase64.includes("image/png")
          ? "image/png"
          : "image/jpeg";
      }

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      };

      const result = await model.generateContent([PROMPT_TEMPLATE, imagePart]);
      const rawText = result.response.text();
      
      if (!rawText) {
        throw new Error("Empty response received from Gemini.");
      }

      // Parse JSON
      const parsedData = JSON.parse(rawText);
      return NextResponse.json(parsedData);
    } catch (apiErr: any) {
      console.error("Gemini API direct failure:", apiErr);
      return NextResponse.json(
        { error: `Gemini API execution error: ${apiErr.message}` },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error("API Audit handler error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during analysis." },
      { status: 500 }
    );
  }
}
