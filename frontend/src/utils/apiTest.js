// Simple API test to debug login issues
import httpClient from './api/httpClient';

export const testLogin = async (email, password) => {
  try {
    console.log('🔍 Testing login API call...');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password ? '[HIDDEN]' : '[EMPTY]');
    
    const response = await httpClient.post('/auth/login', { email, password });
    
    console.log('✅ Response:', response);
    console.log('📦 Response Data:', response.data);
    console.log('🎯 Response Status:', response.status);
    
    return response;
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    console.error('🔍 Error Details:', error);
    throw error;
  }
};
