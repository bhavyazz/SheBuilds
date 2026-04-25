import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const MODEL = 'llama-3.3-70b-versatile';
export default groq;
