// Gera PDFs das plantas e as imagens conceituais a partir do modelo 3D.
// Uso: node scripts/renderizar.js   (requer playwright + chromium)
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const BASE = path.resolve(__dirname, '..');
const VISTAS = ['01_fachada|v=fachada', '02_aerea|v=aerea', '03_fundos|v=fundos', '04_planta_3d|v=planta&rot=1',
  '05_sala_cozinha|v=sala', '06_gourmet|v=gourmet', '07_lavanderia|v=lavanderia', '08_suite_closet|v=suite',
  '09_escritorio|v=escritorio', '10_sacada|v=sacada', '11_garagem|v=garagem'];
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
  await b.close();
})();
