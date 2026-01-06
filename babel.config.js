/**
 * Babel Configuration for Jest
 * 
 * Transforms JSX and modern JavaScript for Jest testing
 * Handles Vite-specific features like import.meta.env
 */

export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
  ],
  plugins: [
    // Transform import.meta.env to process.env for Jest
    function () {
      return {
        visitor: {
          MetaProperty(path) {
            if (
              path.node.meta.name === 'import' &&
              path.node.property.name === 'meta'
            ) {
              // Replace import.meta with a mock object
              path.replaceWithSourceString('({ env: globalThis.import?.meta?.env || {} })');
            }
          },
          MemberExpression(path) {
            // Handle import.meta.env.VITE_* patterns
            if (
              path.node.object &&
              path.node.object.type === 'MetaProperty' &&
              path.node.object.meta.name === 'import' &&
              path.node.object.property.name === 'meta' &&
              path.node.property.name === 'env'
            ) {
              path.replaceWithSourceString('(globalThis.import?.meta?.env || {})');
            }
          },
        },
      };
    },
  ],
};

