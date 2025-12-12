import * as fs from 'fs';
import * as TOML from '@iarna/toml';

export interface MenuItem {
  Id: string;
  Name: string;
  Type: 'link' | 'submenu';
  Link?: string;
  Description?: string;
  Password?: string;
  Disclaimer?: string;
  Children?: MenuItem[];
}

export interface Config {
  server: {
    port: number;
  };
  auth: {
    enabled: boolean;
    authServerUrl: string;
    apiSecret: string;
  };
  Branding?: {
    Title?: string;
    Subtitle?: string;
  };
  Admin?: {
    PanelUrl?: string;
  };
  Menu?: {
    Item?: MenuItem[];
  };
}

export function loadConfig(): Config {
  const configPath = process.cwd() + '/config.toml';
  const configContent = fs.readFileSync(configPath, 'utf-8');
  return TOML.parse(configContent) as unknown as Config;
}
