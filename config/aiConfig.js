
import { Mistral } from "@mistralai/mistralai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

