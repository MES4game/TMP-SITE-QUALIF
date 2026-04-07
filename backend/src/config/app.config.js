import fs from 'fs';
import path from 'path';
let config;
export function getConfig() {
    if (config)
        return config;
    const configPath = path.resolve(process.cwd(), 'config.json');
    if (!fs.existsSync(configPath)) {
        console.warn(`[Warn] config.json not found at ${configPath}. Using defaults.`);
        return {
            port: 3000,
            startDatetime: new Date(),
            freezeDatetime: new Date(Date.now() + 1000 * 60 * 60 * 24) // +1 day
        };
    }
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    config = {
        port: parsed.port || 3000,
        startDatetime: new Date(parsed.startDatetime),
        freezeDatetime: new Date(parsed.freezeDatetime),
    };
    return config;
}
//# sourceMappingURL=app.config.js.map