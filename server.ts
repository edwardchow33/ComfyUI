import express from 'express';
import { glob } from 'glob'
import path from 'path';
var app = express()
const custom_nodes_path = path.join(__dirname, 'custom_nodes');
const web_path = path.join(__dirname, 'web');
const custom = glob.sync(
    path.join(custom_nodes_path, '**/*.js'),
    { ignore: 'node_modules/**' }
);
const custom_extensions = custom.map((f) =>
    "/extensions/" +
    path.relative(custom_nodes_path, f).replace(/\\/g, "/").replace(/\/js\//g, "/")
);

app.use(express.static(web_path));
for (const extension of custom) {
    app.use('/extensions/' + path.relative(custom_nodes_path, extension).replace(/\\/g, "/").replace(/\/js\//g, "/"), express.static(extension));
}
app
    .get('/', function (req, res) {
        res.sendFile(path.join(web_path, 'index.html'));
    });

app.get('/system_stats', function (req, res) {
    res.json({
        "devices": [
            {
                "index": 0,
                "name": "cuda:0 NVIDIA Tesla A200",
                "torch_vram_free": 10000000000000000,
                "torch_vram_total": 10000000000000000,
                "type": "cuda",
                "vram_free": 10000000000000000,
                "vram_total": 10000000000000000
            }
        ],
        "system": {
            "embedded_python": false,
            "os": "Nvidia",
            "python_version": "8.8.8"
        }
    });
})
app.get('/extensions', function (req, res) {
    const web_path = path.join(__dirname, 'web');
    const files = glob.sync(
        path.join(web_path, 'extensions/**/*.js'),
        { ignore: 'node_modules/**' }
    );

    console.log(files)

    const extensions = files.map((f) =>
        "/" +
        path.relative(web_path, f).replace(/\\/g, "/")
    );

    extensions.push(...custom_extensions);

    res.json(extensions);
})
app.listen(3000)
