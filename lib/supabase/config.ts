// Lê as variáveis do Supabase e falha com mensagem clara se estiverem ausentes.
// Os nomes precisam ficar literais (process.env.NEXT_PUBLIC_...) para o Next.js
// substituí-los no código do navegador.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Variáveis do Supabase não configuradas. Crie o arquivo .env.local a partir do .env.example.",
  );
}

export const SUPABASE_URL: string = url;
export const SUPABASE_ANON_KEY: string = anonKey;
