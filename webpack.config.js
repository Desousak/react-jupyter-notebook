const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src/lib', 'JupyterViewer.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'JupyterViewer.js',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 100000,
        },
      },
    ],
  },
  externals: {
    react: 'react',
    reactDOM: 'react-dom',
  },
};
