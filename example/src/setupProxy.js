const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for PLATEAU data hosted on geospatial.jp
  // Helps avoid CORS issues when loading 3D Tiles
  app.use(
    '/api/plateau',
    createProxyMiddleware({
      target: 'https://plateau.geospatial.jp',
      changeOrigin: true,
      pathRewrite: {
        '^/api/plateau': '',
      },
      onProxyRes: function (proxyRes, req, res) {
        // Add CORS headers if needed
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};