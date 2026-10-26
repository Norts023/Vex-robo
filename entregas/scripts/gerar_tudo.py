"""Regera todos os entregaveis a partir de dados/*.csv e roda a verificacao."""
import subprocess
import sys

import gerar_3d
import gerar_orcamento
import gerar_plantas
import gerar_tabela

if __name__ == "__main__":
    gerar_tabela.gerar()
    for p in ("T", "S"):
        gerar_plantas.gerar(p)
    gerar_3d.gerar()
    gerar_orcamento.gerar()
    sys.exit(subprocess.call([sys.executable, __file__.replace("gerar_tudo.py", "verificar.py")]))
