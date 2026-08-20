"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const server = node_http_1.default.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    }
    else {
        res.writeHead(404);
        res.end();
    }
});
const port = parseInt(process.env.PORT || '3000', 10);
server.listen(port, () => console.log(`Backend listening on :${port}`));
//# sourceMappingURL=server.js.map