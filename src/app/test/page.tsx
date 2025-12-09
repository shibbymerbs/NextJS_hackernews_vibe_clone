import React from 'react';

export default function TestRoutesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Freshness Routes Test</h1>

      <div id="test1" className="test info mb-4 p-4 border border-gray-200 rounded">
        <h3 className="font-semibold mb-2">1. Testing /api/stories with freshness sorting</h3>
        <p>Status: Running...</p>
      </div>

      <div id="test2" className="test info mb-4 p-4 border border-gray-200 rounded">
        <h3 className="font-semibold mb-2">2. Testing /api/votes with freshness sorting</h3>
        <p>Status: Running...</p>
      </div>

      <div id="test3" className="test info mb-4 p-4 border border-gray-200 rounded">
        <h3 className="font-semibold mb-2">3. Testing /api/stories without freshness (default)</h3>
        <p>Status: Running...</p>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          async function runTests() {
            // Test 1: Stories with freshness
            try {
              const response = await fetch('/api/stories?sort=freshness');
              const data = await response.json();

              const test1Div = document.getElementById('test1');
              if (response.ok) {
                test1Div.className = 'test success mb-4 p-4 border border-green-200 bg-green-50 rounded';
                test1Div.innerHTML = \`
                  <h3 class="font-semibold mb-2">1. Testing /api/stories with freshness sorting</h3>
                  <p>✅ Success: Returned \${data.length} stories</p>
                  \${data.length > 0 && data[0].freshnessScore !== undefined ?
                    '<p class="text-green-600">✅ Freshness score is present</p>' :
                    '<p class="text-red-600">❌ Freshness score missing</p>'}
                \`;
              } else {
                test1Div.className = 'test error mb-4 p-4 border border-red-200 bg-red-50 rounded';
                test1Div.innerHTML = \`
                  <h3 class="font-semibold mb-2">1. Testing /api/stories with freshness sorting</h3>
                  <p class="text-red-600">❌ Error: \${data.error || 'Unknown error'}</p>
                \`;
              }
            } catch (error) {
              document.getElementById('test1').className = 'test error mb-4 p-4 border border-red-200 bg-red-50 rounded';
              document.getElementById('test1').innerHTML = \`
                <h3 class="font-semibold mb-2">1. Testing /api/stories with freshness sorting</h3>
                <p class="text-red-600">❌ Exception: \${error.message}</p>
              \`;
            }

            // Test 2: Votes with freshness
            try {
              const response = await fetch('/api/votes?sort=freshness');
              const data = await response.json();

              const test2Div = document.getElementById('test2');
              if (response.ok) {
                test2Div.className = 'test success mb-4 p-4 border border-green-200 bg-green-50 rounded';
                test2Div.innerHTML = \`
                  <h3 class="font-semibold mb-2">2. Testing /api/votes with freshness sorting</h3>
                  <p>✅ Success: Returned \${data.length} stories</p>
                  \${data.length > 0 && data[0].freshnessScore !== undefined ?
                    '<p class="text-green-600">✅ Freshness score is present</p>' :
                    '<p class="text-red-600">❌ Freshness score missing</p>'}
                \`;
              } else {
                test2Div.className = 'test error mb-4 p-4 border border-red-200 bg-red-50 rounded';
                test2Div.innerHTML = \`
                  <h3 class="font-semibold mb-2">2. Testing /api/votes with freshness sorting</h3>
                  <p class="text-red-600">❌ Error: \${data.error || 'Unknown error'}</p>
                \`;
              }
            } catch (error) {
              document.getElementById('test2').className = 'test error mb-4 p-4 border border-red-200 bg-red-50 rounded';
              document.getElementById('test2').innerHTML = \`
                <h3 class="font-semibold mb-2">2. Testing /api/votes with freshness sorting</h3>
                <p class="text-red-600">❌ Exception: \${error.message}</p>
              \`;
            }

            // Test 3: Default stories
            try {
              const response = await fetch('/api/stories');
              const data = await response.json();

              const test3Div = document.getElementById('test3');
              if (response.ok) {
                test3Div.className = 'test success mb-4 p-4 border border-green-200 bg-green-50 rounded';
                test3Div.innerHTML = \`
                  <h3 class="font-semibold mb-2">3. Testing /api/stories without freshness (default)</h3>
                  <p>✅ Success: Returned \${data.length} stories</p>
                \`;
              } else {
                test3Div.className = 'test error mb-4 p-4 border border-red-200 bg-red-50 rounded';
                test3Div.innerHTML = \`
                  <h3 class="font-semibold mb-2">3. Testing /api/stories without freshness (default)</h3>
                  <p class="text-red-600">❌ Error: \${data.error || 'Unknown error'}</p>
                \`;
              }
            } catch (error) {
              document.getElementById('test3').className = 'test error mb-4 p-4 border border-red-200 bg-red-50 rounded';
              document.getElementById('test3').innerHTML = \`
                <h3 class="font-semibold mb-2">3. Testing /api/stories without freshness (default)</h3>
                <p class="text-red-600">❌ Exception: \${error.message}</p>
              \`;
            }
          }

          // Run tests when page loads
          window.addEventListener('load', runTests);
        `
      }} />
    </div>
  );
}