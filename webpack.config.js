const path = require('path');

module.exports = {
    entry: './src/main/webapp/resources/js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'src/main/webapp/resources/dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(scss)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    }
};