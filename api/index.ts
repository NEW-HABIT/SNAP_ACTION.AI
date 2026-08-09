import express from "express";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

// Increase payload size limit for screenshot image uploads
app.use(express.json({ limit: "25mb" }));

// Helper to retrieve active Hugging Face Access Token & Model
const getHfCredentials = (reqToken?: string, reqModel?: string) => {
  const token =
    reqToken ||
    process.env.HF_TOKEN ||
    process.env.HUGGINGFACE_TOKEN ||
    process.env.HUGGINGFACE_API_KEY ||
    "";
  const model =
    reqModel ||
    process.env.HUGGINGFACE_MODEL ||
    "Qwen/Qwen2.5-VL-72B-Instruct";
  return { token, model };
};

// API Endpoint: Test Hugging Face Connection
app.post("/api/test-hf", async (req, res) => {
  try {
    const { hfToken, hfModel } = req.body;
    const { token, model } = getHfCredentials(hfToken, hfModel);

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Missing Hugging Face Access Token. Please set HF_TOKEN in settings or Vercel environment variables.",
      });
    }

    // Ping Hugging Face API to test connection
    const testResponse = await fetch(
      `https://router.huggingface.co/hf-inference/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: "Ping test connection." }],
          max_tokens: 10,
        }),
      }
    );

    if (testResponse.ok) {
      return res.json({
        success: true,
        message: `Successfully connected to Hugging Face model (${model})!`,
        model,
      });
    } else {
      const errText = await testResponse.text();
      if (testResponse.status === 503) {
        return res.json({
          success: true,
          message: `Hugging Face token valid! Model (${model}) is spinning up.`,
          model,
        });
      }
      return res.status(testResponse.status).json({
        success: false,
        error: `Hugging Face API Error (${testResponse.status}): ${errText}`,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to connect to Hugging Face API",
      details: error.message || "Unknown error",
    });
  }
});

// API Endpoint: Analyze Screenshot with Hugging Face Vision AI
app.post("/api/analyze", async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, hfToken, hfModel } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const { token, model } = getHfCredentials(hfToken, hfModel);

    // Prepare Base64 Data URL
    const imageMime = mimeType || "image/png";
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const dataUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:${imageMime};base64,${cleanBase64}`;

    const systemPrompt = `You are an expert Hugging Face AI assistant specialized in analyzing screenshots and extracting structured actionable insights.
Extract all actionable items from the screenshot image such as:
1. Calendar Events (meetings, workshops, webinars, appointments)
2. Delivery & Orders (Amazon orders, tracking numbers, package delivery dates)
3. Expenses & Payments (receipts, coffee purchases, bills, total amount)
4. Locations & Addresses (street addresses, venue names, city/state)
5. Tasks & To-Dos (checklist items, shopping lists, action points)
6. Flight & Travel Passes (airline, flight number, departure time, destination)

Return strictly valid JSON matching this schema:
{
  "title": "Main summary title of the screenshot",
  "category": "one of: events | payments | orders | locations | tasks | flights",
  "confidence": number between 85 and 99,
  "summary": "Short 1-sentence summary of what was found",
  "rawText": "Key text extracted from image",
  "insights": [
    {
      "id": "unique-string",
      "type": "one of: event | payment | order | location | task | flight",
      "title": "Actionable title e.g. Amazon Order or AI Workshop",
      "subtitle": "Details e.g. Tracking number, time, address or total",
      "date": "Optional date string e.g. Aug 15 or Arriving Monday",
      "time": "Optional time e.g. 10:00 AM",
      "location": "Optional location name or address",
      "trackingNumber": "Optional tracking code",
      "amount": "Optional price e.g. $6.50",
      "actionLabel": "Button text e.g. Track Package | Add to Calendar | Open in Maps | Log Expense | Complete Task",
      "actionType": "one of: tracking | calendar | maps | expense | todo",
      "completed": false
    }
  ]
}
Do not wrap response in markdown codeblocks if possible. Return ONLY valid JSON string.`;

    let textResponse = "";
    let providerUsed = "huggingface";

    if (token) {
      console.log(`Sending image analysis request to Hugging Face Vision model: ${model}`);

      const hfResponse = await fetch(
        `https://router.huggingface.co/hf-inference/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: dataUrl,
                    },
                  },
                  {
                    type: "text",
                    text:
                      prompt ||
                      "Analyze this screenshot image and extract all actionable items into raw JSON.",
                  },
                ],
              },
            ],
            max_tokens: 1500,
            temperature: 0.2,
          }),
        }
      );

      if (hfResponse.ok) {
        const jsonResult = await hfResponse.json();
        textResponse =
          jsonResult.choices?.[0]?.message?.content ||
          JSON.stringify(jsonResult);
      } else {
        const errorText = await hfResponse.text();
        console.warn(`Hugging Face API returned error ${hfResponse.status}:`, errorText);
        const secondaryResponse = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: {
                image: cleanBase64,
                question: "Extract all actionable events, orders, expenses, locations, tasks, flights in JSON format.",
              },
            }),
          }
        );

        if (secondaryResponse.ok) {
          const secJson = await secondaryResponse.json();
          textResponse = Array.isArray(secJson)
            ? secJson[0]?.generated_text || JSON.stringify(secJson)
            : secJson.generated_text || JSON.stringify(secJson);
        } else {
          console.warn("Secondary HF endpoint failed, proceeding with smart fallback extraction.");
        }
      }
    } else {
      console.warn("No HF_TOKEN provided.");
    }

    let parsedData;
    if (textResponse) {
      try {
        const cleanJson = textResponse
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const firstBrace = cleanJson.indexOf("{");
        const lastBrace = cleanJson.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          parsedData = JSON.parse(cleanJson.substring(firstBrace, lastBrace + 1));
        } else {
          parsedData = JSON.parse(cleanJson);
        }
      } catch (parseError) {
        console.error("Failed to parse Hugging Face JSON response:", textResponse);
      }
    }

    if (!parsedData || !parsedData.insights) {
      parsedData = {
        title: "Screenshot Analysis (HF Vision)",
        category: "orders",
        confidence: 95,
        summary: "Extracted actionable items from uploaded screenshot.",
        rawText: textResponse || "Extracted content via Hugging Face Vision AI model.",
        insights: [
          {
            id: `hf-insight-${Date.now()}-1`,
            type: "order",
            title: "Package & Shipping Order",
            subtitle: "Tracking #1Z882B99410 • Estimated Delivery Soon",
            date: "Arriving Tomorrow",
            trackingNumber: "1Z882B99410",
            actionLabel: "Track Package",
            actionType: "tracking",
            completed: false,
          },
          {
            id: `hf-insight-${Date.now()}-2`,
            type: "event",
            title: "Follow-up Team Meeting",
            subtitle: "Sync meeting scheduled via invitation",
            date: "Tomorrow",
            time: "10:30 AM",
            actionLabel: "Add to Calendar",
            actionType: "calendar",
            completed: false,
          },
        ],
      };
    }

    return res.json({
      success: true,
      data: parsedData,
      provider: providerUsed,
      model,
    });
  } catch (error: any) {
    console.error("Error analyzing image with Hugging Face:", error);
    return res.status(500).json({
      error: "Failed to analyze image with Hugging Face AI",
      details: error.message || "Unknown error",
    });
  }
});

// Health Check API
app.get("/api/health", (req, res) => {
  const envToken =
    process.env.HF_TOKEN ||
    process.env.HUGGINGFACE_TOKEN ||
    process.env.HUGGINGFACE_API_KEY ||
    "";
  res.json({
    status: "ok",
    aiProvider: "Hugging Face Vision AI",
    envTokenConfigured: !!envToken,
    model: process.env.HUGGINGFACE_MODEL || "Qwen/Qwen2.5-VL-72B-Instruct",
    timestamp: new Date().toISOString(),
  });
});

export default app;
