import Groq from 'groq-sdk';

// Initialize the Groq client.
// This will automatically look for the GROQ_API_KEY environment variable.
// We only use this on the server (in API routes).
const groq = new Groq();

export default groq;
