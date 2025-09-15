import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  // Additional Svelte compiler options
  compilerOptions: {
    // Enable runes (Svelte 5 feature)
    runes: true,
  },

  // SvelteKit specific options (if using SvelteKit)
  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapters
    // for a list of available adapters and their docs.
    // adapter: adapterAuto(),
  },
}