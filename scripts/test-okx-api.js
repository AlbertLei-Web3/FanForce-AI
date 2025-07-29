// OKX DEX API 连接测试脚本
// OKX DEX API Connection Test Script

// 尝试加载.env.local，如果不存在则加载.env
require('dotenv').config({ path: '.env.local' });
if (!process.env.OKX_DEX_API_KEY) {
  require('dotenv').config({ path: '.env' });
}

// 使用内置的https模块进行HTTP请求
const https = require('https');
const http = require('http');

async function testOKXAPI() {
  console.log('🔍 Testing OKX DEX API Connection...\n');

  // 检查环境变量
  console.log('📋 Environment Variables Check:');
  console.log('OKX_DEX_API_KEY:', process.env.OKX_DEX_API_KEY ? '✅ Found' : '❌ Missing');
  console.log('OKX_DEX_SECRET:', process.env.OKX_DEX_SECRET ? '✅ Found' : '❌ Missing');
  console.log('OKX_DEX_PASSPHRASE:', process.env.OKX_DEX_PASSPHRASE ? '✅ Found' : '❌ Missing');
  console.log('');

  if (!process.env.OKX_DEX_API_KEY || !process.env.OKX_DEX_SECRET || !process.env.OKX_DEX_PASSPHRASE) {
    console.log('❌ Missing required API credentials!');
    console.log('Please check your .env.local file and ensure all OKX DEX credentials are set.');
    return;
  }

  // 测试API连接
  try {
    console.log('🌐 Testing API Connection...');
    
    const timestamp = new Date().toISOString();
    const method = 'GET';
    const endpoint = '/api/v5/account/balance';
    const url = `https://www.okx.com${endpoint}`;
    
    // 生成签名（简化版本）
    const message = timestamp + method + endpoint;
    const signature = Buffer.from(message + process.env.OKX_DEX_SECRET).toString('base64');
    
    const headers = {
      'OK-ACCESS-KEY': process.env.OKX_DEX_API_KEY,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': process.env.OKX_DEX_PASSPHRASE,
      'Content-Type': 'application/json'
    };

    console.log('📤 Sending test request...');
    
    // 使用内置https模块发送请求
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.okx.com',
        port: 443,
        path: endpoint,
        method: method,
        headers: headers
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve(jsonData);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });
    
    console.log('📥 Response Status: 200');
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.code === '0') {
      console.log('✅ OKX DEX API connection successful!');
      console.log('🎉 Your API credentials are working correctly.');
    } else {
      console.log('❌ API connection failed!');
      console.log('Error Code:', data.code);
      console.log('Error Message:', data.msg);
      
      if (data.code === '50001') {
        console.log('💡 This might be due to:');
        console.log('   - Invalid API key');
        console.log('   - Incorrect passphrase');
        console.log('   - API key permissions');
      }
    }

  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 This might be due to:');
    console.log('   - Network connectivity issues');
    console.log('   - Firewall blocking the request');
    console.log('   - Invalid API endpoint');
  }

  // 测试公开API（不需要认证）
  console.log('\n🔍 Testing Public API (no authentication required)...');
  try {
    const publicData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.okx.com',
        port: 443,
        path: '/api/v5/market/ticker?instId=ETH-USDT',
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(body);
            resolve(jsonData);
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });
    
    if (publicData.code === '0') {
      console.log('✅ Public API connection successful!');
      console.log('📊 Sample ETH price:', publicData.data[0]?.last);
    } else {
      console.log('❌ Public API connection failed!');
    }
  } catch (error) {
    console.log('❌ Public API error:', error.message);
  }
}

// 运行测试
testOKXAPI().catch(console.error); 