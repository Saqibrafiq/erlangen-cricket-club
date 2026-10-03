const config = {
  '*.{ts,tsx,mts,js,mjs,cjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,md,css,yml,yaml}': 'prettier --write',
}

export default config
