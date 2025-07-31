// OKX DEX API 连接测试脚本
// OKX DEX API Connection Test Script

// 尝试加载.env.local，如果不存在则加载.env
require('dotenv').config({ path: '.env.local' });
if (!process.env.OKX_DEX_API_KEY) {
  require('dotenv').config({ path: '.env' });
}

// 添加代理支持
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// 创建HTTP代理代理（V2Ray混合模式使用HTTP代理）
const agent = new HttpsProxyAgent('http://127.0.0.1:10808');

// 测试 OKX DEX 特定端点
// Test OKX DEX specific endpoints
async function testOKXDEXEndpoints() {
  console.log('🔍 Testing OKX DEX Specific Endpoints...\n');

  // 检查环境变量
  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('OKX_DEX_API_KEY:', process.env.OKX_DEX_API_KEY ? `✅ Found (${process.env.OKX_DEX_API_KEY.substring(0, 8)}...)` : '❌ Missing');
  console.log('OKX_DEX_SECRET:', process.env.OKX_DEX_SECRET ? `✅ Found (${process.env.OKX_DEX_SECRET.substring(0, 8)}...)` : '❌ Missing');
  console.log('OKX_DEX_PASSPHRASE:', process.env.OKX_DEX_PASSPHRASE ? `✅ Found (${process.env.OKX_DEX_PASSPHRASE.substring(0, 8)}...)` : '❌ Missing');
  console.log('OKX_DEX_BASE_URL:', process.env.OKX_DEX_BASE_URL || '❌ Missing (using default)');
  console.log('');

  if (!process.env.OKX_DEX_API_KEY || !process.env.OKX_DEX_SECRET || !process.env.OKX_DEX_PASSPHRASE) {
    console.log('❌ Missing required API credentials for DEX testing!');
    return;
  }

  const crypto = require('crypto');
  const baseUrl = process.env.OKX_DEX_BASE_URL || 'https://web3.okx.com';

  // 定义要测试的 DEX 端点
  // Define DEX endpoints to test
  const dexEndpoints = [
    {
      name: 'All Token Balances by Address',
      endpoint: '/api/v5/dex/balance/all-token-balances-by-address',
      method: 'GET',
      params: { address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' } // 示例地址 Example address
    },
    {
      name: 'Supported Chain',
      endpoint: '/api/v5/dex/balance/supported/chain',
      method: 'GET',
      params: {}
    },
    {
      name: 'Token Balances by Address',
      endpoint: '/api/v5/dex/balance/token-balances-by-address',
      method: 'GET',
      params: { 
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chainId: '1' // Ethereum mainnet
      }
    }
  ];

  // 测试每个端点
  // Test each endpoint
  for (const endpointInfo of dexEndpoints) {
    console.log(`\n📊 Testing: ${endpointInfo.name}`);
    console.log(`🌐 Endpoint: ${endpointInfo.endpoint}`);
    
    try {
      const timestamp = new Date().toISOString();
      const method = endpointInfo.method;
      const endpoint = endpointInfo.endpoint;
      
      // 构建查询参数
      // Build query parameters
      const queryParams = new URLSearchParams(endpointInfo.params).toString();
      const fullEndpoint = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      
      // 构建签名字符串
      // Build signature string
      const body = ''; // GET 请求没有 body GET requests have no body
      const message = timestamp + method + fullEndpoint + body;
      
      // 生成签名
      // Generate signature
      const signature = crypto
        .createHmac('sha256', process.env.OKX_DEX_SECRET)
        .update(message)
        .digest('base64');
      
      const headers = {
        'OK-ACCESS-KEY': process.env.OKX_DEX_API_KEY,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': process.env.OKX_DEX_PASSPHRASE,
        'Content-Type': 'application/json'
      };

      console.log('🔐 Request Details:');
      console.log('  Timestamp:', timestamp);
      console.log('  Method:', method);
      console.log('  Full Endpoint:', fullEndpoint);
      console.log('  Message:', message);
      console.log('  Signature:', signature);
      console.log('  URL:', `${baseUrl}${fullEndpoint}`);

      // 发送请求
      // Send request
      const response = await axios.get(`${baseUrl}${fullEndpoint}`, {
        headers: headers,
        httpAgent: agent,
        httpsAgent: agent,
        timeout: 15000
      });

      console.log('✅ Response Status:', response.status);
      console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));

      if (response.data.code === '0') {
        console.log('🎉 Success!');
      } else {
        console.log('❌ API Error:', response.data.msg);
        console.log('Error Code:', response.data.code);
      }

    } catch (error) {
      console.log('❌ Request failed:', error.message);
      if (error.response) {
        console.log('Response status:', error.response.status);
        console.log('Response data:', error.response.data);
      }
    }
  }
}

// 运行测试
async function runAllTests() {
  console.log('🚀 Starting OKX DEX API tests...\n');
  
  // 运行 DEX 特定端点测试
  // Run DEX specific endpoint tests
  await testOKXDEXEndpoints();
}

runAllTests().catch(console.error); 