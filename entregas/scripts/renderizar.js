// Gera PDFs das plantas e as imagens conceituais a partir do modelo 3D.
// Uso: node scripts/renderizar.js   (requer playwright + chromium)
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const BASE = path.resolve(__dirname, '..');
const VISTAS = ['01_fachada|v=fachada', '02_aerea|v=aerea', '03_fundos|v=fundos', '04_planta_3d|v=planta&rot=1',
  '05_sala_cozinha|v=sala', '06_gourmet|v=gourmet', '07_lavanderia|v=lavanderia', '08_suite_closet|v=suite',
  '09_escritorio|v=escritorio', '10_sacada|v=sacada', '11_garagem|v=garagem'];
// experiencia.html (sol, noite, obra, explosao, corte, passeio, tour)
const EXP = ['exp_01_noite_leds|noite=1&hora=19&ui=0&cam=17,-0.45,1.25,3.5,2.5,6',
  'exp_02_obra_estrutura|fase=2&ui=0', 'exp_03_obra_paineis_eps|fase=3&ui=0&hora=15',
  'exp_04_vista_explodida|exp=1&rot=1&ui=0&cam=24,-0.7,1.0,3.5,4,10', 'exp_05_corte_longitudinal|corte=14.5&ui=0&cam=15,2.55,1.15,3.5,2.5,12',
  'exp_06_passeio_sala|eu=4.2,13.3,0.15,0.75,-0.1&ui=0', 'exp_07_passeio_hall_noite|eu=2.9,11.9,3.03,0,-0.1&noite=1&ui=0',
  'exp_08_tour_escada|tour=0.33&ui=0', 'exp_09_sol_verao_17h|dia=355&hora=17&ui=0&cam=26,2.4,1.0,3.5,2,10',
  'exp_10_ficha_e_corte_horizontal|ficha=SUITE&alt=4.2&cam=18,-0.4,0.6,3.5,2,11'];
(async () => {
  const b = await chromium.launch({args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  for (const f of ['02_planta_terreo', '03_planta_superior']) {
    const p = await b.newPage();
    const svg = fs.readFileSync(path.join(BASE, f + '.svg'), 'utf8');
    await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const w = svg.match(/width="(\d+)"/)[1], h = svg.match(/height="(\d+)"/)[1];
    await p.pdf({path: path.join(BASE, f + '.pdf'), width: w + 'px', height: (+h + 2) + 'px', printBackground: true});
    await p.close();
  }
  if (process.argv.includes('--sem-imagens')) { await b.close(); return; }
  const p = await b.newPage({viewport: {width: 1400, height: 900}});
  fs.mkdirSync(path.join(BASE, 'imagens'), {recursive: true});
  for (const v of VISTAS) {
    const [nome, q] = v.split('|');
    await p.goto('file://' + path.join(BASE, '14_modelo_3d', 'index.html') + '?ui=0&' + q);
    await p.waitForFunction(() => window.__pronto === true, {timeout: 60000});
    await p.waitForTimeout(1500);
    await p.screenshot({path: path.join(BASE, 'imagens', nome + '.png'), timeout: 90000});
  }
  for (const v of EXP) {
    const [nome, q] = v.split('|');
    const pg = await b.newPage({viewport: {width: 1400, height: 860}});
    await pg.goto('file://' + path.join(BASE, '14_modelo_3d', 'experiencia.html') + '?' + q, {timeout: 120000});
    await pg.waitForFunction(() => window.__pronto === true, {timeout: 90000});
    await pg.waitForTimeout(2500);
    await pg.screenshot({path: path.join(BASE, 'imagens', nome + '.png'), timeout: 120000});
    await pg.close();
  }
  await b.close();
})();
