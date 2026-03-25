import { buildPrompt } from "../utils/buildPrompt.js";
import { safeParse } from "../utils/safeParse.js";
import { mistral } from "../config/aiConfig.js";


// ─── AI Callers ───────────────────────────────────────────────────────────────

const callGemini = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const isRateLimited = err.status === 429 || err.message?.includes("429");
      const isLastAttempt = i === retries - 1;

      if (isRateLimited && !isLastAttempt) {
        // ✅ Extract retryDelay from Gemini error response
        const retryMatch = err.message?.match(/Please retry in (\d+(\.\d+)?)s/);
        const waitTime = retryMatch
          ? parseFloat(retryMatch[1]) * 1000 // use Gemini's suggested wait
          : 2 ** i * 10000; // fallback: 10s, 20s, 40s

        console.warn(
          `Gemini rate limited. Retrying in ${waitTime / 1000}s... (attempt ${i + 1}/${retries})`,
        );
        await new Promise((res) => setTimeout(res, waitTime));
      } else {
        throw err;
      }
    }
  }
};


export const callMistral = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await mistral.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content;
    } catch (err) {
      const isRateLimited = err.status === 429;
      const isLastAttempt = i === retries - 1;

      if (isRateLimited && !isLastAttempt) {
        const waitTime = 2 ** i * 10000; // 10s, 20s, 40s (Mistral free = 2 RPM so wait longer)
        console.warn(
          `Mistral rate limited. Retrying in ${waitTime / 1000}s... (attempt ${i + 1}/${retries})`,
        );
        await new Promise((res) => setTimeout(res, waitTime));
      } else {
        console.error("Mistral failed:", err.message);
        throw err;
      }
    }
  }
};

export const generateMarketingContent = async (params) => {
  const prompt = buildPrompt(params);
  try {
    const geminiText = await callGemini(prompt);
    const parsed = safeParse(geminiText);
    if (parsed) return { provider: "gemini", data: parsed };
  } catch (err) {
    console.error("Gemini error message:", err.message);
    console.error("Gemini error details:", err);
  }

  try {
    const mistralText = await callMistral(prompt);
    const parsed = safeParse(mistralText);
    if (parsed) return { provider: "mistral", data: parsed };
  } catch (err) {
    console.error("mistral failed:", err.message);
  }

  throw new Error("AI providers unavailable");
};
