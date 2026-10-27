import { defineConfig } from 'vite';
// Repository GitHub Pages uses /repository-name/; username.github.io uses /.
const repository = (process.env.GITHUB_REPOSITORY || '').split('/').pop();
const base = process.env.ACTA_BASE || (repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/');
export default defineConfig({ base, build: { target: 'es2022' } });
