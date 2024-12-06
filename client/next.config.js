const config = require("../config");
const { version } = require("./package.json");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    styledComponents: true,
  },
  publicRuntimeConfig: {
    ...config.envs,
    SQ_VERSION: version,
  },
  serverRuntimeConfig: {
    ...config.envs,
    ...config.secrets,
  },
};

module.exports = nextConfig;
