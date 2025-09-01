const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for geographic 3D Tiles data
  // Helps avoid CORS issues when loading 3D Tiles from external sources
  app.use(
    '/api/tiles',
    createProxyMiddleware({
      target: 'https://plateau.geospatial.jp',
      changeOrigin: true,
      pathRewrite: {
        '^/api/tiles': '',
      },
      onProxyRes: function (proxyRes, req, res) {
        // Add CORS headers if needed
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};