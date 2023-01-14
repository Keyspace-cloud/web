const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const manifestVersion = Number(process.env.MANIFEST_VERSION)
const copyPluginOptions = []

if (manifestVersion) {
    console.log(`Building for manifest version ${manifestVersion}`)
    if (manifestVersion === 2) {
        copyPluginOptions.push('./src/manifest.json')
    } else
        copyPluginOptions.push({
            from: './src/manifest.v3.json',
            to: 'manifest.json',
        })
}

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
        })
    )
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false,
        },
    })

    if (copyPluginOptions.length)
        config.plugins.push(
            new CopyWebpackPlugin({
                patterns: copyPluginOptions,
            })
        )

    return config
}
