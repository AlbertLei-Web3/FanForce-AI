// 代理配置 / Proxy Configuration

export interface ProxyConfig {
  socks5: {
    host: string;
    port: number;
    enabled: boolean;
  };
  http: {
    host: string;
    port: number;
    enabled: boolean;
  };
}

// 默认代理配置 - 请根据你的VPN设置修改
export const proxyConfig: ProxyConfig = {
  socks5: {
    host: '127.0.0.1',
    port: 10808, // V2rayN Shadowsocks端口
    enabled: true
  },
  http: {
    host: '127.0.0.1',
    port: 48023, // 你的HTTP代理端口
    enabled: false
  }
};

// 获取代理URL
export function getProxyUrl(): string | null {
  if (proxyConfig.socks5.enabled) {
    return `socks5://${proxyConfig.socks5.host}:${proxyConfig.socks5.port}`;
  } else if (proxyConfig.http.enabled) {
    return `http://${proxyConfig.http.host}:${proxyConfig.http.port}`;
  }
  return null;
}

// 检查代理是否启用
export function isProxyEnabled(): boolean {
  return proxyConfig.socks5.enabled || proxyConfig.http.enabled;
} 