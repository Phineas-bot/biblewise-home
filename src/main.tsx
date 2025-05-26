import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// TODO: Replace with your actual Stripe publishable key, ideally from an environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

createRoot(document.getElementById("root")!).render(
  <Elements stripe={stripePromise}>
    <App />
  </Elements>
);
