// Test Team Drafts API
// 测试队伍草稿API

import fetch from 'node-fetch';

async function testTeamDraftsAPI() {
  try {
    console.log('Testing team drafts API...');
    
    const ambassadorId = '1de6110a-f982-4f7f-979e-00e7f7d33bed';
    const url = `http://localhost:3000/api/ambassador/team-drafts?ambassador_id=${ambassadorId}`;
    
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testTeamDraftsAPI(); 