import type { ReactNode } from "react";

type Props = { tipo: "erro" | "sucesso"; children: ReactNode };

export function Alerta({ tipo, children }: Props) {
  const estilo =
    tipo === "erro"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${estilo}`}>
      {children}
    </div>
  );
}
