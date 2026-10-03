/**
 * Architecture rules from CLAUDE.md §4.3. Violations fail CI.
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies make modules impossible to reason about in isolation.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment: 'domain/ is framework-free TypeScript: it may only import other domain modules.',
      from: { path: '^src/domain/', pathNot: '\\.test\\.ts$' },
      to: { pathNot: '^src/domain/' },
    },
    {
      name: 'shared-not-to-features-or-app',
      severity: 'error',
      comment: 'shared/ is the lowest layer above domain; it never depends on features or routes.',
      from: { path: '^src/shared/' },
      to: { path: '^src/(features|app|cms)/' },
    },
    {
      name: 'features-not-to-app',
      severity: 'error',
      comment: 'Dependencies point inward: app -> features, never the reverse.',
      from: { path: '^src/features/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'feature-public-api-only',
      severity: 'error',
      comment: 'A feature may use another feature only through its index.ts (information hiding).',
      from: { path: '^src/features/([^/]+)/' },
      to: {
        path: '^src/features/[^/]+/',
        pathNot: ['^src/features/$1/', '^src/features/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'app-uses-feature-public-api',
      severity: 'error',
      comment: 'Routes compose features through their public API only.',
      from: { path: '^src/app/' },
      to: { path: '^src/features/[^/]+/', pathNot: '^src/features/[^/]+/index\\.ts$' },
    },
    {
      name: 'payload-access-is-contained',
      severity: 'error',
      comment:
        'Only features/*/server, cms/ and the Payload config may talk to Payload or the database at runtime.',
      from: {
        pathNot: [
          '^src/features/[^/]+/server/',
          '^src/cms/',
          '^src/payload\\.config\\.ts$',
          '^src/app/\\(payload\\)/',
        ],
      },
      to: {
        path: ['(^|/)node_modules/(payload|@payloadcms)/', '^src/payload\\.config\\.ts$'],
        // Exception: the Lexical JSX renderer only turns stored rich-text JSON into markup — no
        // data access — so presentational components may use it.
        pathNot: '(^|/)node_modules/@payloadcms/richtext-lexical/dist/exports/react/',
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Unreferenced modules are usually dead code.',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '\\.(test|stories)\\.tsx?$',
          '^src/app/',
          '^src/proxy\\.ts$',
          '^src/payload\\.config\\.ts$',
          '^src/payload-types\\.ts$',
          '^src/i18n/(request|navigation)\\.ts$',
          '/index\\.ts$',
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: ['\\.next/', 'src/payload-types\\.ts$'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
}
