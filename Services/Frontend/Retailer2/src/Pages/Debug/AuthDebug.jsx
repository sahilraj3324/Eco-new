import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const AuthDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, fetchCurrentUser, logout } = useAuthContext();

  const runTest = async (testName, testFunction) => {
    setLoading(true);
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, [testName]: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testBackend = async () => {
    try {
      const response = await axios.get('/api/Buyer/test', {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return { error: error.message, details: error.response?.data };
    }
  };

  const testCookies = async () => {
    try {
      const response = await axios.get('/api/Buyer/test-cookies', {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  };

  const testBrowserCookies = () => {
    // Test if browser can set and read cookies
    const testCookieName = 'testCookie';
    const testCookieValue = 'testValue123';
    
    // Set a test cookie
    document.cookie = `${testCookieName}=${testCookieValue}; path=/; max-age=3600`;
    
    // Try to read it back
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    
    const cookieReadBack = cookies[testCookieName];
    
    // Clean up
    document.cookie = `${testCookieName}=; path=/; max-age=0`;
    
    return {
      cookieSet: testCookieValue,
      cookieRead: cookieReadBack,
      success: cookieReadBack === testCookieValue,
      allCookies: Object.keys(cookies),
      rawCookieString: document.cookie
    };
  };

  const checkCurrentCookies = () => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      if (cookie.trim()) {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
      }
      return acc;
    }, {});
    
    return {
      allCookies: cookies,
      hasAuthToken: !!cookies.token,
      authTokenValue: cookies.token,
      rawCookieString: document.cookie
    };
  };

  const getAuthStatus = () => {
    return {
      isAuthenticated,
      user,
      hasUser: !!user
    };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Panel</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Current Auth State:</h2>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.Email : 'None'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => runTest('backendTest', testBackend)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Test Backend Connection
        </button>
        
        <button
          onClick={() => runTest('authStatus', getAuthStatus)}
          className="bg-purple-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Get Auth Status
        </button>
        
        <button
          onClick={() => runTest('browserCookieTest', testBrowserCookies)}
          className="bg-orange-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Test Browser Cookies
        </button>
        
        <button
          onClick={() => runTest('currentCookies', checkCurrentCookies)}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Check Current Cookies
        </button>
        
        <button
          onClick={() => runTest('getCurrentUser', fetchCurrentUser)}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Fetch Current User
        </button>
        
        <button
          onClick={() => logout()}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Logout
        </button>
        
        <button
          onClick={() => setResults({})}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Results
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Results:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>First, test browser cookies to ensure cookies work in your browser</li>
          <li>Check current cookies to see what's already set</li>
          <li>Try logging in from the login page</li>
          <li>Come back here and check current cookies again</li>
          <li>Test Fetch Current User to see if authentication works</li>
          <li>Check auth status to see the current state</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthDebug; 