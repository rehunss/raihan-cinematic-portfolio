import { chromium } from 'playwright';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
const origin=process.env.PREVIEW_URL||'http://127.0.0.1:4174/raihan-cinematic-portfolio/';
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL || undefined,headless:true});
try{
  const page=await browser.newPage({viewport:{width:1123,height:794}});
  await page.goto(`${origin}?print=1`,{waitUntil:'networkidle'});
  await page.emulateMedia({media:'print',reducedMotion:'reduce'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const pages=await page.locator('.pdf-page').count();
  if(pages!==10)throw new Error(`Expected 10 designed pages, found ${pages}`);
  const overflow=await page.locator('.pdf-page').evaluateAll(els=>els.map((el,i)=>({page:i+1,overflow:el.scrollHeight>el.clientHeight+1,footerCollision:[...el.children].filter(c=>!c.classList.contains('pdf-footer')).some(c=>c.getBoundingClientRect().bottom>el.querySelector('.pdf-footer').getBoundingClientRect().top-8)})).filter(x=>x.overflow||x.footerCollision));
  if(overflow.length){await mkdir('qa/pdf',{recursive:true});await page.locator('.pdf-page').nth(overflow[0].page-1).screenshot({path:'qa/pdf/layout-overflow.png'});console.log(await page.locator('.pdf-page').nth(overflow[0].page-1).evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight,children:[...el.children].map(c=>({class:c.className,height:c.getBoundingClientRect().height,bottom:c.getBoundingClientRect().bottom-el.getBoundingClientRect().top}))})));throw new Error(`Page overflow: ${JSON.stringify(overflow)}`);}
  await mkdir('output/pdf',{recursive:true});
  const path='output/pdf/Raihan_Signals_in_Motion_Portfolio.pdf';
  await page.pdf({path,format:'A4',landscape:true,printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,tagged:true,outline:true});
  await copyFile(path,'public/documents/Raihan_Signals_in_Motion_Portfolio.pdf');
  await mkdir('qa/pdf',{recursive:true});
  for(let i=0;i<10;i++)await page.locator('.pdf-page').nth(i).screenshot({path:`qa/pdf/browser-page-${i+1}.png`});
  await writeFile('qa/pdf/build.json',JSON.stringify({pages,origin,output:path,generatedAt:new Date().toISOString(),overflow},null,2));
  console.log(`Created ${path}; ${pages} A4 landscape pages, selectable text and public links.`);
}finally{await browser.close();}
