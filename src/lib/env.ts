function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function withoutTrailingSlash(value: string | undefined) {
  return value?.replace(/\/$/, '');
}

export const clientEnv = {
  supabaseUrl: required(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_URL'
  ),

  supabaseAnonKey: required(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ),

  appUrl:
    withoutTrailingSlash(process.env.NEXT_PUBLIC_APP_URL) ??
    'http://localhost:3000',
};

export const env = {
  get supabaseUrl() {
    return required(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  },
  get supabaseAnonKey() {
    return required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  },
  get supabaseServiceRoleKey() {
    return required(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
  },
  get appUrl() {
    return (
      withoutTrailingSlash(process.env.NEXT_PUBLIC_APP_URL) ??
      "http://localhost:3000"
    );
  },
  get groqApiKey() {
    return process.env.GROQ_API_KEY;
  },
  get groqApiUrl() {
    return (
      process.env.GROQ_API_URL ??
      "https://api.groq.com/openai/v1/chat/completions"
    );
  },
  get groqModel() {
    return process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
  },
  get geminiApiKey() {
    return process.env.GEMINI_API_KEY;
  },
  get geminiModel() {
    return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  },
  get geminiFallbackModel() {
    return process.env.GEMINI_FALLBACK_MODEL ?? "gemini-2.0-flash";
  },
  get adminEmails() {
    return (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  },
};
