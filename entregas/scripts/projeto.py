"""Fonte unica de dados do estudo conceitual (Casa EPS - Cajamar/SP).

Todas as plantas (SVG/DXF/PDF), a tabela de areas (XLSX) e o modelo 3D (HTML)
sao gerados a partir dos CSV em ../dados. Nenhuma medida aqui e executiva:
sao dimensoes CONCEITUAIS / APROXIMADAS para discussao com arquiteto e engenheiro.

Convencao de eixos: x = largura do lote (0 = divisa esquerda, olhando da rua),
y = profundidade (0 = alinhamento frontal / rua, 20 = divisa de fundo).
Lados de um ambiente: S = lado y0 (rua), N = lado y1 (fundo), W = x0, E = x1.
"""
import csv
import hashlib
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DADOS = os.path.join(BASE, "dados")

LOTE_L = 7.00
LOTE_P = 20.00
T_PAREDE = 0.15          # espessura conceitual de parede acabada (painel EPS + revestimento) - HIPOTESE
EPS = 1e-6
SOLIDOS = ("fechado", "coberto")

# Coeficientes de equivalencia de custo (referencia: ABNT NBR 12721, faixas usuais) - HIPOTESE
COEF_EQUIV = {"GAR": 0.75, "GOURMET": 0.75, "SACADA": 0.40}

PREMISSAS_LEGAIS = {  # NAO CONFIRMADAS em legislacao de Cajamar - ver 00_premissas.md
    "recuo_frontal_m": 4.00,
    "afast_janela_divisa_m": 1.50,   # Codigo Civil, art. 1.301 (lei federal)
    "taxa_ocupacao_max": 0.70,
    "taxa_permeab_min": 0.15,
}


def _f(v):
    return float(v) if v not in ("", None) else 0.0


def ler_csv(nome):
    with open(os.path.join(DADOS, nome), newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def hash_dados():
    h = hashlib.sha256()
    for nome in ("ambientes.csv", "pavimentos.csv", "aberturas.csv", "externas.csv", "mobiliario.csv"):
        with open(os.path.join(DADOS, nome), "rb") as fh:
            h.update(fh.read())
    return h.hexdigest()[:12]


def ambientes():
    out = []
    for r in ler_csv("ambientes.csv"):
        r = dict(r)
        for k in ("x0", "y0", "x1", "y1", "area_ref"):
            r[k] = _f(r[k])
        r["computa"] = int(r["computa"])
        r["abertos"] = set(r["lados_abertos"].strip())
        r["larg"] = round(r["x1"] - r["x0"], 4)
        r["prof"] = round(r["y1"] - r["y0"], 4)
        r["area_bruta"] = round(r["larg"] * r["prof"], 4)
        out.append(r)
    _deducoes(out)
    return out


def pavimentos():
    out = {}
    for r in ler_csv("pavimentos.csv"):
        r["area_declarada_m2"] = _f(r["area_declarada_m2"])
        r["cota_piso_m"] = _f(r["cota_piso_m"])
        r["pe_direito_m"] = _f(r["pe_direito_m"])
        out[r["pav"]] = r
    return out


def externas():
    out = []
    for r in ler_csv("externas.csv"):
        for k in ("x0", "y0", "x1", "y1", "coef_perm"):
            r[k] = _f(r[k])
        r["area"] = round((r["x1"] - r["x0"]) * (r["y1"] - r["y0"]), 4)
        out.append(r)
    return out


def aberturas():
    out = []
    for r in ler_csv("aberturas.csv"):
        for k in ("coord", "a", "b", "altura", "peitoril"):
            r[k] = _f(r[k])
        out.append(r)
    return out


def mobiliario():
    out = []
    for r in ler_csv("mobiliario.csv"):
        for k in ("x0", "y0", "x1", "y1", "altura"):
            r[k] = _f(r[k])
        out.append(r)
    return out


def _sobrepoe(a0, a1, b0, b1):
    return min(a1, b1) - max(a0, b0) > EPS


def vizinhos_lado(amb, r, lado):
    """Ambientes solidos do mesmo pavimento que tocam o lado indicado de r."""
    res = []
    for o in amb:
        if o is r or o["pav"] != r["pav"] or o["tipo"] not in SOLIDOS:
            continue
        if lado == "W" and abs(o["x1"] - r["x0"]) < EPS and _sobrepoe(o["y0"], o["y1"], r["y0"], r["y1"]):
            res.append(o)
        elif lado == "E" and abs(o["x0"] - r["x1"]) < EPS and _sobrepoe(o["y0"], o["y1"], r["y0"], r["y1"]):
            res.append(o)
        elif lado == "S" and abs(o["y1"] - r["y0"]) < EPS and _sobrepoe(o["x0"], o["x1"], r["x0"], r["x1"]):
            res.append(o)
        elif lado == "N" and abs(o["y0"] - r["y1"]) < EPS and _sobrepoe(o["x0"], o["x1"], r["x0"], r["x1"]):
            res.append(o)
    return res


def _deducoes(amb):
    """Desconto de parede por lado para estimar a area util.

    lado aberto -> 0 ; lado com ambiente solido vizinho -> meia parede (0.075) ;
    lado externo (divisa, fachada, patio, sacada) -> parede inteira (0.15).
    """
    for r in amb:
        d = {}
        for lado in "WESN":
            if r["tipo"] not in SOLIDOS or lado in r["abertos"]:
                d[lado] = 0.0
            elif vizinhos_lado(amb, r, lado):
                d[lado] = T_PAREDE / 2
            else:
                d[lado] = T_PAREDE
        r["ded"] = d
        r["larg_util"] = round(r["larg"] - d["W"] - d["E"], 4)
        r["prof_util"] = round(r["prof"] - d["S"] - d["N"], 4)
        r["area_util"] = round(r["larg_util"] * r["prof_util"], 4)


def resumo(amb=None):
    amb = amb or ambientes()
    pav = pavimentos()
    res = {}
    for p in pav:
        sel = [r for r in amb if r["pav"] == p and r["computa"]]
        bruta = sum(r["area_bruta"] for r in sel)
        util = sum(r["area_util"] for r in sel)
        res[p] = {"bruta": round(bruta, 3), "util": round(util, 3), "paredes": round(bruta - util, 3),
                  "declarada": pav[p]["area_declarada_m2"]}
    return res


# ---------------------------------------------------------------- paredes
def _linhas(amb, pav):
    """Retorna lista de segmentos de parede: dict(eixo, coord, a, b, tipo, lado_solido)."""
    rooms = [r for r in amb if r["pav"] == pav]
    linhas = {}
    for r in rooms:
        if r["tipo"] not in SOLIDOS:
            continue
        for eixo, coord, a, b in (("x", r["x0"], r["y0"], r["y1"]), ("x", r["x1"], r["y0"], r["y1"]),
                                  ("y", r["y0"], r["x0"], r["x1"]), ("y", r["y1"], r["x0"], r["x1"])):
            linhas.setdefault((eixo, round(coord, 4)), set()).update([a, b])
    segs = []
    for (eixo, coord), pts in linhas.items():
        # quebra em todos os pontos de ambientes solidos que tocam a linha
        for r in rooms:
            if eixo == "x" and (abs(r["x0"] - coord) < EPS or abs(r["x1"] - coord) < EPS):
                pts.update([r["y0"], r["y1"]])
            if eixo == "y" and (abs(r["y0"] - coord) < EPS or abs(r["y1"] - coord) < EPS):
                pts.update([r["x0"], r["x1"]])
        pts = sorted(pts)
        for a, b in zip(pts, pts[1:]):
            if b - a < EPS:
                continue
            m = (a + b) / 2
            neg = pos = None   # ambiente do lado negativo / positivo da linha
            for r in rooms:
                if r["tipo"] not in SOLIDOS:
                    continue
                if eixo == "x" and r["y0"] - EPS <= m <= r["y1"] + EPS:
                    if abs(r["x1"] - coord) < EPS:
                        neg = r
                    if abs(r["x0"] - coord) < EPS:
                        pos = r
                if eixo == "y" and r["x0"] - EPS <= m <= r["x1"] + EPS:
                    if abs(r["y1"] - coord) < EPS:
                        neg = r
                    if abs(r["y0"] - coord) < EPS:
                        pos = r
            if not neg and not pos:
                continue
            lado_neg = "E" if eixo == "x" else "N"
            lado_pos = "W" if eixo == "x" else "S"
            aberto = (neg and lado_neg in neg["abertos"]) or (pos and lado_pos in pos["abertos"])
            if aberto:
                continue
            if neg and pos:
                tipo, lado = "interna", 0
            else:
                tipo, lado = "externa", (-1 if neg else +1)   # lado em que fica a parede
            segs.append({"eixo": eixo, "coord": coord, "a": a, "b": b, "tipo": tipo, "lado": lado})
    # funde segmentos continuos de mesmo tipo
    segs.sort(key=lambda s: (s["eixo"], s["coord"], s["tipo"], s["lado"], s["a"]))
    fund = []
    for s in segs:
        if fund:
            u = fund[-1]
            if (u["eixo"], u["coord"], u["tipo"], u["lado"]) == (s["eixo"], s["coord"], s["tipo"], s["lado"]) \
                    and abs(u["b"] - s["a"]) < EPS:
                u["b"] = s["b"]
                continue
        fund.append(dict(s))
    return fund


def paredes(amb, pav, pe_direito):
    """Pecas de parede (retangulos em planta + faixa de altura) ja descontando aberturas.

    Retorna lista de dict(x0,y0,x1,y1,z0,z1,tipo).
    """
    abert = [o for o in aberturas() if o["pav"] == pav]
    pecas = []
    for s in _linhas(amb, pav):
        t = T_PAREDE
        if s["tipo"] == "interna":
            o0, o1 = s["coord"] - t / 2, s["coord"] + t / 2
        elif s["lado"] < 0:
            o0, o1 = s["coord"] - t, s["coord"]
        else:
            o0, o1 = s["coord"], s["coord"] + t
        # aberturas nesta linha
        cortes = sorted([o for o in abert if o["eixo"] == s["eixo"] and abs(o["coord"] - s["coord"]) < EPS
                         and _sobrepoe(o["a"], o["b"], s["a"], s["b"])], key=lambda o: o["a"])
        cur = s["a"]
        intervals = []
        for o in cortes:
            a, b = max(o["a"], s["a"]), min(o["b"], s["b"])
            if a > cur + EPS:
                intervals.append((cur, a, 0, pe_direito))
            if o["tipo"] == "janela":
                intervals.append((a, b, 0, o["peitoril"]))
                top = o["peitoril"] + o["altura"]
                if top < pe_direito - EPS:
                    intervals.append((a, b, top, pe_direito))
            else:
                if o["altura"] < pe_direito - EPS:
                    intervals.append((a, b, o["altura"], pe_direito))
            cur = max(cur, b)
        if cur < s["b"] - EPS:
            intervals.append((cur, s["b"], 0, pe_direito))
        for a, b, z0, z1 in intervals:
            if z1 - z0 < EPS or b - a < EPS:
                continue
            if s["eixo"] == "x":
                pecas.append({"x0": o0, "x1": o1, "y0": a, "y1": b, "z0": z0, "z1": z1, "tipo": s["tipo"]})
            else:
                pecas.append({"x0": a, "x1": b, "y0": o0, "y1": o1, "z0": z0, "z1": z1, "tipo": s["tipo"]})
    return pecas


def lote_resumo(amb=None):
    amb = amb or ambientes()
    ext = externas()
    area_lote = LOTE_L * LOTE_P
    proj = sum(r["area_bruta"] for r in amb if r["pav"] == "T" and r["tipo"] in SOLIDOS)
    descob_t = sum(r["area_bruta"] for r in amb if r["pav"] == "T" and r["tipo"] == "descoberto")
    perm = sum(e["area"] * e["coef_perm"] for e in ext)
    return {"area_lote": area_lote, "projecao": round(proj, 3), "descoberto_terreo": round(descob_t, 3),
            "to": proj / area_lote, "permeavel": round(perm, 3), "tp": perm / area_lote,
            "fechamento_lote": round(proj + descob_t, 3)}
