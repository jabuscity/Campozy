import * as fs from 'fs';
import * as path from 'path';

function search(dir, depth = 0) {
  if (depth > 3) return;
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const p = path.join(dir, f);
      try {
        const stat = fs.statSync(p);
        if (stat.isDirectory() && !f.startsWith('.') && f !== 'node_modules' && f !== 'supabase' && f !== '.git') {
          search(p, depth + 1);
        } else if (stat.isFile() && (/\.(env|toml|json|yaml|yml|md)$/.test(f) || f.includes('config'))) {
          const content = fs.readFileSync(p, 'utf-8');
          const matches = content.match(/password|pg_password|DB_PASS|database.*pass/gi);
          if (matches) {
            console.log(p + ': ' + matches.slice(0, 5).join(', '));
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

search(process.cwd());
