import { redirect } from "next/navigation";

// O proxy envia para /login quem não estiver autenticado.
export default function Home() {
  redirect("/dashboard");
}
