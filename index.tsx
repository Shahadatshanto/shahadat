
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Could not find root element to mount to");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Failed to render the app:", err);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center;">
        <h2 style="color: #ef4444;">অ্যাপটি লোড হতে সমস্যা হয়েছে</h2>
        <p>দয়া করে পেজটি রিফ্রেশ করুন অথবা আপনার ব্রাউজার আপডেট করুন।</p>
      </div>
    `;
  }
}
