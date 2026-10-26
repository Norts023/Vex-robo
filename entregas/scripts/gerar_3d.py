"""Gera 14_modelo_3d/index.html (Three.js) a partir dos mesmos CSV das plantas e da tabela."""
import json
import os
import shutil

import projeto as P

LAJE = 0.18


def gerar():
    amb = P.ambientes()
    pav = P.pavimentos()
    dados = {
        "hash": P.hash_dados(),
        "lote": [P.LOTE_L, P.LOTE_P],
        "laje": LAJE,
        "pav": {k: {"z": v["cota_piso_m"], "pd": v["pe_direito_m"], "nome": v["nome"]} for k, v in pav.items()},
        "ambientes": [{k: a[k] for k in ("id", "pav", "nome", "tipo", "computa", "x0", "y0", "x1", "y1",
                                         "area_bruta", "area_util")} for a in amb],
        "paredes": {p: P.paredes(amb, p, pav[p]["pe_direito_m"]) for p in pav},
        "aberturas": P.aberturas(),
        "externas": P.externas(),
        "mobiliario": P.mobiliario(),
        "resumo": P.resumo(amb),
    }
    pasta = os.path.join(P.BASE, "14_modelo_3d")
    os.makedirs(pasta, exist_ok=True)
    with open(os.path.join(pasta, "dados_modelo.json"), "w", encoding="utf-8") as fh:
        json.dump(dados, fh, ensure_ascii=False, indent=1)
    tpl = open(os.path.join(os.path.dirname(__file__), "modelo_3d_template.html"), encoding="utf-8").read()
    html = tpl.replace("/*__DADOS__*/null", json.dumps(dados, ensure_ascii=False))
    with open(os.path.join(pasta, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(html)
    return pasta


if __name__ == "__main__":
    print(gerar())
