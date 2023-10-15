const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
    const isDebug = env && (env.NODE_ENV === 'dev' || env.NODE_ENV === 'test');

    return {
        entry: './src/game.ts',
        mode: env.NODE_ENV === 'dev' ? 'development' : 'production',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true,
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
            ],
        },
        devServer: {
            static: {
                directory: path.resolve(__dirname, './dist'),
            },
            host: '0.0.0.0',
            port: 8080,
            open: true,
        },
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                phaser: path.resolve(
                    __dirname,
                    'node_modules/phaser/dist/phaser.js'
                ),
            },
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.IS_DEBUG': JSON.stringify(isDebug),
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'assets/img/**', to: '.' },
                    { from: 'index.html', to: '.' },
                    { from: 'index.css', to: '.' },
                    { from: 'favicon.ico', to: '.' },
                    { from: 'icon*.png', to: '.' },
                    { from: 'manifest.json', to: '.' },
                ],
            }),
        ],
    };
};
