import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./server";

// Usado nas ações do servidor: garante usuário logado antes de ler ou gravar dados.
export async function exigirUsuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}
