const config = {
  api: {
    endpoint: process.env.REACT_APP_API_ENDPOINT,
  },
  app: {
    env: process.env.NODE_ENV,
  },
  donateUrl: process.env.REACT_APP_DONATE_URL,
  donateEnabled: process.env.REACT_APP_DONATE_ENABLED === 'true',
  requestAidEnabled: process.env.REACT_APP_REQUEST_AID_ENABLED === 'true',
};
console.log('config:', config);

export default config;
