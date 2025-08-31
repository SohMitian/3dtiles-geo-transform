const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // geospatial.jpにホストされているPLATEAUデータ用のプロキシ
  // 3D Tilesをロードする際のCORS問題を回避するのに役立ちます
  app.use(
    '/api/plateau',
    createProxyMiddleware({
      target: 'https://plateau.geospatial.jp',
      changeOrigin: true,
      pathRewrite: {
        '^/api/plateau': '',
      },
      onProxyRes: function (proxyRes, req, res) {
        // 必要に応じてCORSヘッダーを追加
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};