#!/usr/bin/env node
import { config } from 'dotenv';
import { spawn } from 'node:child_process';
config({ path: '.env.local' });
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const url = process.env.VITE_PUBLIC_SUPABASE_URL;
if (!url) {
    const found = Object.keys(process.env).filter((k) => k.startsWith('VITE_'));
    console.error('Missing VITE_PUBLIC_SUPABASE_URL in .env.local');
    console.error(`Found VITE_ keys: ${found.join(', ') || '(none)'}`);
    process.exit(1);
}

const match = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/i);
if (!match) {
    console.error(`Could not parse project ref from ${url}`);
    process.exit(1);
}
const projectRef = match[1];

const out = 'src/types/database.ts';
mkdirSync(dirname(out), { recursive: true });

const proc = spawn(
    'npx',
    ['supabase', 'gen', 'types', 'typescript', '--project-id', projectRef],
    { shell: true, stdio: ['inherit', 'pipe', 'inherit'] },
);

let buf = '';
proc.stdout.on('data', (chunk) => {
    buf += chunk;
});
proc.on('close', (code) => {
    if (code !== 0) {
        console.error(`supabase gen types exited with code ${code}`);
        process.exit(code);
    }
    writeFileSync(out, buf);
    console.log(`Wrote ${out}`);
});
