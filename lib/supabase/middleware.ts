import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Rotas que exigem login.
const ROTAS_PROTEGIDAS = ["/dashboard", "/redefinir-senha"];
// Rotas só para visitantes (quem já entrou é levado ao dashboard).
const ROTAS_DE_VISITANTE = ["/login", "/cadastro", "/recuperar-senha"];

function comecaCom(pathname: string, prefixos: string[]) {
  return prefixos.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Renova o token de sessão em cada requisição e aplica as regras de acesso.
export async function atualizarSessao(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser valida o token no servidor do Supabase. getSession não faz essa validação.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && comecaCom(pathname, ROTAS_PROTEGIDAS)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && comecaCom(pathname, ROTAS_DE_VISITANTE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
