import 'server-only';

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function withoutTrailingSlash(value: string | undefined): string | undefined {
  return value?.replace(/\/$/, '');
}

export const serverEnv = {
  supabaseUrl: required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL'
  ),

  supabaseAnonKey: required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ),

  supabaseServiceRoleKey: required(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    'SUPABASE_SERVICE_ROLE_KEY'
  ),

  appUrl:
    withoutTrailingSlash(process.env.NEXT_PUBLIC_APP_URL) ??
    'http://localhost:3000',

  groqApiKey: process.env.GROQ_API_KEY,

  groqApiUrl:
    process.env.GROQ_API_URL ??
    'https://api.groq.com/openai/v1/chat/completions',

  groqModel:
    process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant',

  geminiApiKey: process.env.GEMINI_API_KEY,

  geminiModel:
    process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',

  geminiFallbackModel:
    process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-2.0-flash',

  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
};