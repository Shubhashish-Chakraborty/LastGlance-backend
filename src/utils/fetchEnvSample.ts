import * as fs from 'fs';
import * as path from 'path';

const envSampleFilePath = path.resolve(process.cwd(), '.env.sample');

export const getEnvKeys = () => {
    const fileContent = fs.readFileSync(envSampleFilePath, 'utf-8');
    const envKeys = fileContent.trim().split('\n').filter(line => line.trim() && !line.trim().startsWith('#')).map(line => line.split('=')[0]!.trim());
    return envKeys;
}