const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolver configuration
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@supabase/') || moduleName.startsWith('@react-native-async-storage/')) {
    return {
      filePath: require.resolve(moduleName, { paths: [context.originModulePath] }),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;