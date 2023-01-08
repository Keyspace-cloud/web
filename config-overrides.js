const webpack = require('webpack')
const CopyWebpackPlugin = require("copy-webpack-plugin");
const manifestVersion = process.env.MANIFEST_VERSION == 3 ? 3 : 2

console.log(`Building for manifest version ${manifestVersion}`)

module.exports = function override(config, env) {
    config.resolve.fallback = {
        util: require.resolve('util/'),
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path'),
        fs: false,
        crypto: false,
    }
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.optimize.AggressiveSplittingPlugin({
            minSize: 20000,
            maxSize: 50000,
        }),
        new CopyWebpackPlugin({
            patterns: [
                manifestVersion == 3
                    ? { from: './src/manifest.v3.json', to: 'manifest.json' }
                    : './src/manifest.json',
            ],
        })
    )
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false,
        },
    })

    return config
}
