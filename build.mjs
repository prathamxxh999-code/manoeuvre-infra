import fs from 'node:fs';
import path from 'node:path';
import { projects, legacy, accomplished } from './src/data.mjs';
import { buildPages } from './src/templates.mjs';
const root=process.cwd();
const dist=path.join(root,'dist');
fs.mkdirSync(dist,{recursive:true});
for(const [src,dest] of [['v2.css','styles.css'],['v2.js','app.js'],['scene.js','scene.js']])fs.copyFileSync(path.join(root,'src',src),path.join(dist,dest));
const pages=buildPages(projects,legacy,accomplished);
for(const [name,html] of Object.entries(pages)){const dest=path.join(dist,name);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html,'utf8');}
console.log(`Built ${Object.keys(pages).length} redesigned pages.`);
