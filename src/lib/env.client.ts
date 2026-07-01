function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function withoutTrailingSlash(value: string | undefined): string | undefined {
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