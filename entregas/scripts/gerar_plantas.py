"""Gera as plantas conceituais (SVG + DXF) a partir de ../dados/*.csv.

Saidas: 02_planta_terreo.svg/.dxf e 03_planta_superior.svg/.dxf em /entregas.
"""
import math
import os

import ezdxf
from ezdxf.enums import TextEntityAlignment

import projeto as P

ESC = 55.0          # px por metro no SVG
MX, MY = 150, 120   # margens
CORES = {"fechado": "#f4efe7", "coberto": "#e9e4dc", "descoberto": "#e3ecd9", "vazio": "#ffffff"}
CORES_ID = {"GAR": "#e6e6e6", "GOURMET": "#efe3d3", "SACADA": "#dfe9d2", "PATIO": "#e3ecd9",
            "POCO": "#ffffff", "RECUO": "#e3ecd9", "JARDIM_F": "#d6e6c8"}
TITULO = {"T": ("02_planta_terreo", "PLANTA CONCEITUAL - TERREO"),
          "S": ("03_planta_superior", "PLANTA CONCEITUAL - PAVIMENTO SUPERIOR")}


def fmt(v, n=2):
    return f"{v:.{n}f}".replace(".", ",")


class SVG:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.el = []

    def X(self, x):
        return MX + x * ESC

    def Y(self, y):  # rua embaixo, fundo em cima
        return self.h - MY - y * ESC

    def rect(self, x0, y0, x1, y1, fill="none", stroke="#000", sw=1, extra=""):
        self.el.append(f'<rect x="{self.X(x0):.1f}" y="{self.Y(y1):.1f}" width="{(x1 - x0) * ESC:.1f}" '
                       f'height="{(y1 - y0) * ESC:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def line(self, x0, y0, x1, y1, stroke="#000", sw=1, extra=""):
        self.el.append(f'<line x1="{self.X(x0):.1f}" y1="{self.Y(y0):.1f}" x2="{self.X(x1):.1f}" '
                       f'y2="{self.Y(y1):.1f}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def text(self, x, y, s, size=11, anchor="middle", weight="normal", fill="#222", rot=0, raw=False):
        px, py = (x, y) if raw else (self.X(x), self.Y(y))
        tr = f' transform="rotate({rot} {px:.1f} {py:.1f})"' if rot else ""
        s = s.replace("&", "&amp;").replace("<", "&lt;")
        self.el.append(f'<text x="{px:.1f}" y="{py:.1f}" font-family="DejaVu Sans, Arial" font-size="{size}" '
                       f'text-anchor="{anchor}" font-weight="{weight}" fill="{fill}"{tr}>{s}</text>')

    def path(self, d, stroke="#000", sw=1, fill="none", extra=""):
        self.el.append(f'<path d="{d}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}" {extra}/>')

    def out(self):
        head = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
                f'viewBox="0 0 {self.w} {self.h}">\n<rect width="100%" height="100%" fill="#fff"/>\n'
                '<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" '
                'patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#9bb" stroke-width="1"/>'
                '</pattern></defs>\n')
        return head + "\n".join(self.el) + "\n</svg>\n"


def cotas_eixo(valores, fixo, eixo, svg, dxf, off):
    """Cadeia de cotas (SVG + DXF). eixo='x' -> cota horizontal abaixo; 'y' -> vertical a esquerda."""
    vals = sorted(set(round(v, 3) for v in valores))
    for a, b in zip(vals, vals[1:]):
        if b - a < 0.05:
            continue
        if eixo == "x":
            svg.line(a, fixo, b, fixo, "#c33", 0.8)
            for v in (a, b):
                svg.line(v, fixo - 0.08, v, fixo + 0.08, "#c33", 0.8)
            svg.text((a + b) / 2, fixo + 0.12, fmt(b - a), 9, fill="#c33")
            dxf.add_linear_dim(base=((a + b) / 2, fixo), p1=(a, fixo + off), p2=(b, fixo + off),
                               dimstyle="CONCEITO", dxfattribs={"layer": "COTAS"}).render()
        else:
            svg.line(fixo, a, fixo, b, "#c33", 0.8)
            for v in (a, b):
                svg.line(fixo - 0.08, v, fixo + 0.08, v, "#c33", 0.8)
            svg.text(svg.X(fixo) - 6, svg.Y((a + b) / 2) + 3, fmt(b - a), 9, anchor="end", fill="#c33", raw=True)
            dxf.add_linear_dim(base=(fixo, (a + b) / 2), p1=(fixo + off, a), p2=(fixo + off, b), angle=90,
                               dimstyle="CONCEITO", dxfattribs={"layer": "COTAS"}).render()


def gerar(pav):
    amb = P.ambientes()
    pv = P.pavimentos()[pav]
    hsh = P.hash_dados()
    nome_arq, titulo = TITULO[pav]
    W = int(MX * 2 + P.LOTE_L * ESC + 420)
    H = int(MY + 40 + P.LOTE_P * ESC + 60)
    s = SVG(W, H)

    doc = ezdxf.new("R2010", setup=True)
    doc.header["$INSUNITS"] = 6  # metros
    ds = doc.dimstyles.duplicate_entry("EZDXF", "CONCEITO")
    ds.dxf.dimtxt, ds.dxf.dimasz, ds.dxf.dimdec, ds.dxf.dimexe, ds.dxf.dimexo = 0.12, 0.08, 2, 0.05, 0.05
    ds.dxf.dimdsep = ord(",")
    for nm, c in (("LOTE", 8), ("AMBIENTES", 3), ("PAREDES", 7), ("ABERTURAS", 4), ("MOBILIARIO", 9),
                  ("TEXTOS", 2), ("COTAS", 1), ("NORTE", 5), ("PROJECOES", 6), ("CARIMBO", 7)):
        doc.layers.add(nm, color=c)
    msp = doc.modelspace()

    def drect(x0, y0, x1, y1, layer, closed=True, dash=False):
        attrs = {"layer": layer}
        if dash:
            attrs["linetype"] = "DASHED"
        msp.add_lwpolyline([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], close=closed, dxfattribs=attrs)

    def dtext(x, y, t, h=0.14, layer="TEXTOS"):
        msp.add_text(t, height=h, dxfattribs={"layer": layer}).set_placement(
            (x, y), align=TextEntityAlignment.MIDDLE_CENTER)

    # lote
    s.rect(0, 0, P.LOTE_L, P.LOTE_P, "none", "#555", 1.2, 'stroke-dasharray="8 4"')
    drect(0, 0, P.LOTE_L, P.LOTE_P, "LOTE", dash=True)
    rf = P.PREMISSAS_LEGAIS["recuo_frontal_m"]
    s.line(0, rf, P.LOTE_L, rf, "#999", 0.8, 'stroke-dasharray="3 3"')
    s.text(P.LOTE_L + 0.1, rf - 0.05, f"recuo frontal {fmt(rf)} m (hipotese)", 8, anchor="start", fill="#777")
    s.text(P.LOTE_L / 2, -0.68, "RUA / ALINHAMENTO FRONTAL (muro e portao fora do escopo)", 10, fill="#555")
    dtext(P.LOTE_L / 2, -0.55, "RUA / ALINHAMENTO FRONTAL", 0.16, "LOTE")

    # externas (somente terreo)
    if pav == "T":
        for e in P.externas():
            cor = "#cfe0bf" if e["coef_perm"] > 0 else "#d9d6d0"
            s.rect(e["x0"], e["y0"], e["x1"], e["y1"], cor, "#bbb", 0.4)
    # ambientes
    for r in amb:
        if r["pav"] != pav:
            continue
        if pav == "T" and r["id"] == "RECUO":
            continue
        fill = CORES_ID.get(r["id"], CORES[r["tipo"]])
        if r["tipo"] == "vazio":
            fill = "url(#hatch)"
        s.rect(r["x0"], r["y0"], r["x1"], r["y1"], fill, "#bbb", 0.5)
        drect(r["x0"], r["y0"], r["x1"], r["y1"], "AMBIENTES")
    # projecao da cobertura da gourmet no superior
    if pav == "S":
        g = next(r for r in amb if r["id"] == "GOURMET")
        s.rect(g["x0"], g["y0"], g["x1"], g["y1"], "#f3f3f3", "#888", 0.8, 'stroke-dasharray="6 3"')
        s.text((g["x0"] + g["x1"]) / 2, (g["y0"] + g["y1"]) / 2, "laje de cobertura da gourmet", 9, fill="#777")
        s.text((g["x0"] + g["x1"]) / 2, (g["y0"] + g["y1"]) / 2 - 0.3, "(nao acessivel - abaixo)", 8, fill="#777")
        drect(g["x0"], g["y0"], g["x1"], g["y1"], "PROJECOES", dash=True)
        jf = next(r for r in amb if r["id"] == "JARDIM_F")
        s.rect(jf["x0"], jf["y0"], jf["x1"], jf["y1"], "#e8f0e0", "#bbb", 0.4)
        s.text((jf["x0"] + jf["x1"]) / 2, (jf["y0"] + jf["y1"]) / 2, "jardim (abaixo)", 8, fill="#777")

    # mobiliario indicativo
    for m in P.mobiliario():
        if m["pav"] != pav:
            continue
        s.rect(m["x0"], m["y0"], m["x1"], m["y1"], "none", "#8a8a8a", 0.7, 'stroke-dasharray="2 2"')
        drect(m["x0"], m["y0"], m["x1"], m["y1"], "MOBILIARIO")
        if m["id"] in ("CAR_L", "CAR_R", "MOTO"):
            s.text((m["x0"] + m["x1"]) / 2, (m["y0"] + m["y1"]) / 2, m["nome"].split(" (")[0], 9, fill="#666",
                   rot=-90)

    # escada: degraus (16 espelhos de ~0,18 m; pisos de 0,27 m) - conceitual
    esc = next(r for r in amb if r["pav"] == pav and r["id"] in ("ESC_T", "ESC_S"))
    xa, xm, xb = esc["x0"] + 0.15, esc["x0"] + 0.15 + 0.85, esc["x0"] + 0.15 + 0.85 + 0.15
    ytop = esc["y1"] - 0.075
    # lance 1 (lado do hall): sobe da sala (fundo) para a frente; 8 pisos
    for i in range(9):
        y = ytop - i * 0.27
        s.line(xb, y, xb + 0.85, y, "#555", 0.7)
        msp.add_line((xb, y), (xb + 0.85, y), dxfattribs={"layer": "ABERTURAS"})
    # lance 2 (junto a divisa): do patamar (frente) para o fundo; 6 pisos
    y_pat = esc["y0"] + 0.075 + 0.90
    for i in range(7):
        y = y_pat + i * 0.27
        s.line(xa, y, xm, y, "#555", 0.7)
        msp.add_line((xa, y), (xm, y), dxfattribs={"layer": "ABERTURAS"})
    s.line(xm + 0.075, esc["y0"] + 0.9, xm + 0.075, ytop, "#555", 1.5)
    s.rect(xa, esc["y0"] + 0.075, xb + 0.85, y_pat, "none", "#555", 0.7)
    s.text(xb + 0.42, ytop - 1.2, "SOBE" if pav == "T" else "", 8, fill="#444", rot=-90)
    s.text((xa + xm) / 2, y_pat + 1.0, "1-16" if pav == "T" else "chegada", 7, fill="#444", rot=-90)
    s.text((xa + xb + 0.85) / 2, esc["y0"] + 0.5, "patamar", 7, fill="#444")

    # paredes
    for pc in P.paredes(amb, pav, pv["pe_direito_m"]):
        if pc["z0"] > 0.01:  # somente pecas que tocam o piso aparecem cortadas em planta
            continue
        full = pc["z1"] >= pv["pe_direito_m"] - 0.01
        cor = "#222" if full else "#777"
        s.rect(pc["x0"], pc["y0"], pc["x1"], pc["y1"], cor, cor, 0.3)
        if full:
            h = msp.add_hatch(color=7, dxfattribs={"layer": "PAREDES"})
            h.paths.add_polyline_path([(pc["x0"], pc["y0"]), (pc["x1"], pc["y0"]), (pc["x1"], pc["y1"]),
                                       (pc["x0"], pc["y1"])], is_closed=True)
        drect(pc["x0"], pc["y0"], pc["x1"], pc["y1"], "PAREDES")

    # aberturas
    for o in P.aberturas():
        if o["pav"] != pav:
            continue
        a, b, c = o["a"], o["b"], o["coord"]
        larg = b - a
        if o["eixo"] == "y":
            seg = ((a, c), (b, c))
        else:
            seg = ((c, a), (c, b))
        if o["tipo"] == "janela":
            for d in (-0.05, 0, 0.05):
                if o["eixo"] == "y":
                    s.line(a, c + d, b, c + d, "#1b5e9a", 1)
                else:
                    s.line(c + d, a, c + d, b, "#1b5e9a", 1)
            msp.add_line(*seg, dxfattribs={"layer": "ABERTURAS"})
        elif o["tipo"] in ("porta", "porta_pivotante"):
            # folha + arco de giro (para o lado "de")
            de = next((r for r in amb if r["id"] == o["de"] and r["pav"] == pav), None)
            sinal = 1
            if de:
                cx, cy = (de["x0"] + de["x1"]) / 2, (de["y0"] + de["y1"]) / 2
                sinal = 1 if ((cy > c) if o["eixo"] == "y" else (cx > c)) else -1
            if o["eixo"] == "y":
                hx, hy = a, c
                fx, fy = a, c + sinal * larg
                s.line(hx, hy, fx, fy, "#1b5e9a", 1.2)
                s.path(f"M {s.X(b):.1f} {s.Y(c):.1f} A {larg * ESC:.1f} {larg * ESC:.1f} 0 0 "
                       f"{0 if sinal > 0 else 1} {s.X(fx):.1f} {s.Y(fy):.1f}", "#1b5e9a", 0.7,
                       extra='stroke-dasharray="3 2"')
                msp.add_line((hx, hy), (fx, fy), dxfattribs={"layer": "ABERTURAS"})
                msp.add_arc((hx, hy), larg, 0 if sinal > 0 else 270, 90 if sinal > 0 else 360,
                            dxfattribs={"layer": "ABERTURAS"})
            else:
                hx, hy = c, a
                fx, fy = c + sinal * larg, a
                s.line(hx, hy, fx, fy, "#1b5e9a", 1.2)
                s.path(f"M {s.X(c):.1f} {s.Y(b):.1f} A {larg * ESC:.1f} {larg * ESC:.1f} 0 0 "
                       f"{1 if sinal > 0 else 0} {s.X(fx):.1f} {s.Y(fy):.1f}", "#1b5e9a", 0.7,
                       extra='stroke-dasharray="3 2"')
                msp.add_line((hx, hy), (fx, fy), dxfattribs={"layer": "ABERTURAS"})
                msp.add_arc((hx, hy), larg, 0 if sinal > 0 else 90, 90 if sinal > 0 else 180,
                            dxfattribs={"layer": "ABERTURAS"})
            if o["tipo"] == "porta_pivotante":
                s.text((a + b) / 2 if o["eixo"] == "y" else c, c - 0.35 if o["eixo"] == "y" else a,
                       "ENTRADA PRINCIPAL", 9, weight="bold", fill="#1b5e9a")
                s.text((a + b) / 2, c - 0.6, "pivotante 1,00 x 2,60", 8, fill="#1b5e9a")
        elif o["tipo"] == "porta_correr":
            for d in (-0.04, 0.04):
                if o["eixo"] == "y":
                    s.line(a, c + d, (a + b) / 2 + 0.1, c + d, "#1b5e9a", 1.4)
                    s.line((a + b) / 2 - 0.1, c - d, b, c - d, "#1b5e9a", 1.4)
                else:
                    s.line(c + d, a, c + d, (a + b) / 2 + 0.1, "#1b5e9a", 1.4)
                    s.line(c - d, (a + b) / 2 - 0.1, c - d, b, "#1b5e9a", 1.4)
            msp.add_line(*seg, dxfattribs={"layer": "ABERTURAS"})
        # vao_livre: nada (apenas sem parede)

    # guarda-corpo da sacada
    if pav == "S":
        s.line(0.05, 4.03, 6.95, 4.03, "#1b5e9a", 2.2, 'stroke-dasharray="10 3"')
        s.text(3.5, 3.75, "guarda-corpo vidro laminado h=1,10 m (pendencia de norma)", 8, fill="#1b5e9a")
        msp.add_line((0, 4.03), (7, 4.03), dxfattribs={"layer": "ABERTURAS"})

    # rotulos dos ambientes
    for r in amb:
        if r["pav"] != pav:
            continue
        cx, cy = (r["x0"] + r["x1"]) / 2, (r["y0"] + r["y1"]) / 2
        if r["id"] == "GAR":
            cx, cy = 3.0, 7.6
        if r["id"] == "SALA_COZ":
            cx, cy = 2.0, 13.4
        if r["id"] in ("ESC_T", "ESC_S"):
            continue
        nm = r["nome"]
        tam = 10 if r["larg"] > 3.2 else 8
        rot = -90 if r["larg"] < 1.7 and r["prof"] > 2.5 else 0
        if rot:
            s.text(cx - 0.08, cy, nm.upper(), tam, weight="bold", rot=rot)
            s.text(cx + 0.22, cy, f"{fmt(r['area_util'])} m2 uteis", 8, rot=rot, fill="#444")
        else:
            s.text(cx, cy + 0.12, nm.upper(), tam, weight="bold")
            if r["tipo"] in P.SOLIDOS:
                s.text(cx, cy - 0.18, f"{fmt(r['area_util'])} m2 uteis | {fmt(r['larg'])} x {fmt(r['prof'])} (eixo)",
                       8, fill="#444")
            else:
                s.text(cx, cy - 0.18, f"{fmt(r['area_bruta'])} m2 ({'nao computa' if not r['computa'] else ''})", 8,
                       fill="#444")
        dtext(cx, cy + 0.12, nm.upper(), 0.13)
        dtext(cx, cy - 0.15, f"{fmt(r['area_util'])} m2 (aprox.)", 0.10)
    s.text(1.0, (esc["y0"] + esc["y1"]) / 2 + 0.9, "ESCADA U", 8, weight="bold", rot=-90)
    dtext(1.0, (esc["y0"] + esc["y1"]) / 2, "ESCADA U", 0.12)

    # cotas
    xs = {0, P.LOTE_L}
    ys = {0, P.LOTE_P}
    for r in amb:
        if r["pav"] == pav and r["tipo"] in P.SOLIDOS + ("descoberto", "vazio") and r["id"] != "RECUO":
            xs.update([r["x0"], r["x1"]])
            ys.update([r["y0"], r["y1"]])
    ys.add(P.PREMISSAS_LEGAIS["recuo_frontal_m"])
    cotas_eixo(xs, -0.25, "x", s, msp, 0)
    cotas_eixo(ys, -0.45, "y", s, msp, 0)
    cotas_eixo({0, P.LOTE_L}, -1.30, "x", s, msp, 0)
    cotas_eixo({0, P.LOTE_P}, -1.25, "y", s, msp, 0)

    # norte (HIPOTESE: fundo voltado para o norte)
    nx, ny = P.LOTE_L + 2.4, P.LOTE_P - 1.2
    s.path(f"M {s.X(nx):.1f} {s.Y(ny + 0.7):.1f} L {s.X(nx - 0.3):.1f} {s.Y(ny - 0.4):.1f} "
           f"L {s.X(nx):.1f} {s.Y(ny - 0.15):.1f} Z", "#000", 1, "#000")
    s.path(f"M {s.X(nx):.1f} {s.Y(ny + 0.7):.1f} L {s.X(nx + 0.3):.1f} {s.Y(ny - 0.4):.1f} "
           f"L {s.X(nx):.1f} {s.Y(ny - 0.15):.1f} Z", "#000", 1, "#fff")
    s.text(nx, ny + 0.85, "N", 14, weight="bold")
    s.text(nx, ny - 0.8, "NORTE = HIPOTESE", 8, fill="#c33")
    s.text(nx, ny - 1.05, "(confirmar em levantamento)", 8, fill="#c33")
    msp.add_line((nx, ny - 0.4), (nx, ny + 0.7), dxfattribs={"layer": "NORTE"})
    dtext(nx, ny + 0.9, "N (HIPOTESE)", 0.2, "NORTE")

    # carimbo / legenda
    lx = P.LOTE_L + 0.9
    linhas = [
        (titulo, 13, "bold"),
        ("Casa contemporanea em EPS - Cajamar/SP", 10, "normal"),
        ("Lote 7,00 x 20,00 m = 140,00 m2", 10, "normal"),
        ("", 6, "normal"),
        (f"Area bruta do pavimento: {fmt(sum(r['area_bruta'] for r in amb if r['pav'] == pav and r['computa']))} m2", 10, "bold"),
        (f"Area util estimada: {fmt(sum(r['area_util'] for r in amb if r['pav'] == pav and r['computa']))} m2", 10, "normal"),
        (f"Pe-direito conceitual: {fmt(pv['pe_direito_m'])} m | piso {fmt(pv['cota_piso_m'])} m", 9, "normal"),
        ("", 6, "normal"),
        ("ESTUDO CONCEITUAL - MEDIDAS APROXIMADAS", 10, "bold"),
        ("Nao e projeto executivo, legal ou estrutural.", 9, "normal"),
        ("Paredes: 0,15 m conceituais (EPS + revestimento).", 9, "normal"),
        ("Cotas em metros, nos eixos dos ambientes.", 9, "normal"),
        ("Recuo frontal, TO, TP e norte = HIPOTESES.", 9, "normal"),
        ("Exige ART/RRT e aprovacao municipal.", 9, "normal"),
        ("", 6, "normal"),
        (f"Fonte: dados/ambientes.csv  [hash {hsh}]", 8, "normal"),
        ("Legenda: azul = esquadrias | tracejado = mobiliario", 8, "normal"),
        ("cinza = parede baixa / peitoril | hachura = vazio", 8, "normal"),
    ]
    yy = s.Y(P.LOTE_P - 3.6)
    for t, sz, wgt in linhas:
        s.text(s.X(lx), yy, t, sz, anchor="start", weight=wgt, raw=True)
        yy += sz + 6
    for i, (t, sz, _) in enumerate(linhas[:16]):
        if t:
            msp.add_text(t, height=0.14 if i else 0.2, dxfattribs={"layer": "CARIMBO"}).set_placement(
                (lx, P.LOTE_P - 4 - i * 0.3), align=TextEntityAlignment.LEFT)

    os.makedirs(P.BASE, exist_ok=True)
    with open(os.path.join(P.BASE, nome_arq + ".svg"), "w", encoding="utf-8") as fh:
        fh.write(s.out())
    doc.saveas(os.path.join(P.BASE, nome_arq + ".dxf"))
    return nome_arq


if __name__ == "__main__":
    for p in ("T", "S"):
        print("gerado", gerar(p))
