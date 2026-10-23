"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { EstadoFormulario } from "@/app/auth/actions";
import { Alerta } from "./alerta";

export type CampoFormulario = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  placeholder?: string;
};

type Props = {
  acao: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  campos: CampoFormulario[];
  textoBotao: string;
  variante?: "padrao" | "perigo";
};

// Formulário genérico: mostra erros por campo e mantém o que foi digitado após um erro.
export function FormularioAuth({ acao, campos, textoBotao, variante = "padrao" }: Props) {
  const [estado, formAction] = useActionState(acao, {});

  return (
    // A chave muda a cada erro. Assim o formulário é recriado com os valores de `estado.valores`.
    <form key={estado.ciclo} action={formAction} noValidate className="space-y-4">
      {estado.erro && <Alerta tipo="erro">{estado.erro}</Alerta>}
      {estado.sucesso && <Alerta tipo="sucesso">{estado.sucesso}</Alerta>}

      {campos.map((campo) => {
        const erroCampo = estado.campos?.[campo.name];
        const idErro = `${campo.name}-erro`;
        return (
          <div key={campo.name}>
            <label htmlFor={campo.name} className="block text-sm font-medium text-slate-700">
              {campo.label}
            </label>
            <input
              id={campo.name}
              name={campo.name}
              type={campo.type ?? "text"}
              autoComplete={campo.autoComplete}
              placeholder={campo.placeholder}
              defaultValue={estado.valores?.[campo.name]}
              aria-invalid={erroCampo ? true : undefined}
              aria-describedby={erroCampo ? idErro : undefined}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 ${
                erroCampo
                  ? "border-red-400 focus:ring-red-200"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-200"
              }`}
            />
            {erroCampo && (
              <p id={idErro} className="mt-1 text-sm text-red-600">
                {erroCampo}
              </p>
            )}
          </div>
        );
      })}

      <BotaoEnviar variante={variante}>{textoBotao}</BotaoEnviar>
    </form>
  );
}

function BotaoEnviar({ children, variante }: { children: string; variante: "padrao" | "perigo" }) {
  const { pending } = useFormStatus();
  const cor = variante === "perigo" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${cor}`}
    >
      {pending ? "Aguarde..." : children}
    </button>
  );
}
