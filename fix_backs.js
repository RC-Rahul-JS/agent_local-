import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src', 'routes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('window.history.back()')) {
    content = content.replace(/window\.history\.back\(\)/g, "navigate(-1)");
    
    if (!content.includes('useNavigate')) {
       content = content.replace(/import /, "import { useNavigate } from 'react-router-dom';\nimport ");
    }
    
    if (!content.includes('const navigate = useNavigate();')) {
       content = content.replace(/(const\s+[A-Z]\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{|export\s+default\s+function\s+[A-Z]\w+\s*\([^)]*\)\s*\{)/, "$1\n  const navigate = useNavigate();\n");
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
