

// module.exports = function override(config, env) {
//     //do stuff with the webpack config...
//     config.resolve.fallback = { 
//         "path": false,
//         "stream": false,
//         "crypto": false 
//     }
    
//     return config;
// }

/* config-overrides.js */
const webpack = require('webpack');
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
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.optimize.AggressiveSplittingPlugin({
            minSize: 20000,
            maxSize: 50000
          }),
    );
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
    })

    return config;
}
