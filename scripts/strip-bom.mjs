// 发布守门：package.json 若带 UTF-8 BOM，宿主的 JSON.parse 会抛错导致插件装完不生效。
// 此脚本在 npm pack/publish 之前把 BOM 剥掉，避免再次出现 1.0.1 的问题。
import { readFileSync, writeFileSync } from 'node:fs';

const BOM = '\uFEFF';
for (const file of ['package.json']) {
  const text = readFileSync(file, 'utf8');
  if (text.startsWith(BOM)) {
    writeFileSync(file, text.slice(1), 'utf8');
    console.log(`[strip-bom] removed BOM from ${file}`);
  } else {
    console.log(`[strip-bom] ${file} has no BOM`);
  }
}
