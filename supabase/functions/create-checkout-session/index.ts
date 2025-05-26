import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0'; // Use a specific version

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(), // Deno specific
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      userId,
      userEmail,
      planId, // e.g., "course_single", "sub_full_monthly"
      // amount, // Amount from client can be used for display, but price ID from DB is safer
      // currency, // Same as amount
      mode, // "payment" or "subscription"
      // interval, // "month" or "year" - this is more for our DB, Stripe price ID dictates interval
      metadata = {}, // e.g., { courseId: "123" }
    } = await req.json();

    if (!userId || !userEmail || !planId || !mode) {
      return new Response(JSON.stringify({ error: 'Missing required parameters.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Get/Create Stripe Customer ID
    let stripeCustomerId: string;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 'No rows found'
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      stripeCustomerId = customer.id;

      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateProfileError) {
        console.error('Error updating profile with Stripe Customer ID:', updateProfileError);
        // If this fails, we might have an orphaned Stripe customer, but checkout can proceed.
        // Consider retry logic or cleanup for production.
      }
    }
    
    // 2. Fetch Stripe Price ID from your 'products' table based on planId
    // This is a simplified mapping. In a real app, planId might directly be the stripe_price_id
    // or you'd have a more robust lookup.
    let stripePriceId: string | undefined;

    // The planId from the client (e.g., "course_single", "sub_full_monthly")
    // should map to a specific product entry in your database.
    // We'll use the `name` column from the `products` table for this mapping for now.
    // Ideally, the client sends a product ID or a Stripe Price ID it fetched earlier.
    
    let productQueryName = '';
    if (planId === 'course_single') {
        productQueryName = 'Single Course Purchase';
    } else if (planId === 'sub_full_monthly') {
        productQueryName = 'Full Access Subscription - Monthly';
    } else if (planId === 'sub_full_annual') {
        productQueryName = 'Full Access Subscription - Annual';
    } else {
        return new Response(JSON.stringify({ error: 'Invalid planId.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { data: productData, error: productError } = await supabaseAdmin
      .from('products')
      .select('stripe_price_id')
      .eq('name', productQueryName) // Assuming planId maps to a unique name
      .eq('active', true)
      .single();

    if (productError || !productData?.stripe_price_id) {
      console.error('Error fetching product/price ID from DB:', productError);
      const userMessage = productError?.code === 'PGRST116' ? 'Plan not found or not active.' : 'Could not find price for the selected plan.';
      return new Response(JSON.stringify({ error: userMessage, details: productError?.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    stripePriceId = productData.stripe_price_id;


    // 3. Create Stripe Checkout Session
    const successUrl = `${Deno.env.get('SITE_URL')}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${Deno.env.get('SITE_URL')}/subscription-plans`;

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode, // 'payment' or 'subscription'
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        supabase_user_id: userId,
        ...(metadata.courseId && { course_id: String(metadata.courseId) }), // Ensure course_id is string
      },
    };
    
    // If it's a subscription and it's for the main "Full Access" product,
    // include trial settings if applicable, or tax rates, etc.
    // For this example, keeping it simple.

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-checkout-session:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// To deploy (after setting up Supabase CLI and linking project):
// supabase functions deploy create-checkout-session --no-verify-jwt (if handling auth manually or service role)
// JWT verification is usually good, but for simplicity in initial setup,
// if user ID is passed from a trusted client (after auth), --no-verify-jwt can be used.
// Or, ensure the client sends the Supabase Auth JWT in the Authorization header.
// The function above assumes userId is correctly passed.
// For production, proper JWT verification or other auth mechanisms are crucial.
// Supabase client on the frontend automatically includes Authorization header if user is logged in.
// So, if calling via authenticated Supabase client, JWT is usually available in function context.
// The code here directly uses `userId` from request body, implying client handles auth.
// A more secure way for Supabase functions is to get user from `await supabaseClient.auth.getUser()`
// if the Authorization header with JWT is passed from the client.
// For this example, we'll assume the `userId` is passed securely from an authenticated client context.
// The Supabase client on the frontend, when invoking a function, should automatically pass the Authorization header.
// Edge functions can then use this to get the user:
// const user = await supabase.auth.api.getUserByCookie(req) or using context.
// However, the provided structure here is a common way to start if client manages user context pre-call.
// For Deno Deploy, ensure STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SITE_URL are set.
// console.log(`Function create-checkout-session is up and running!`);
// The above log won't show in serve, but is a placeholder.
// Shared CORS headers
// supabase/functions/_shared/cors.ts
// export const corsHeaders = {
//   'Access-Control-Allow-Origin': '*', // Or your specific origin
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// };
// This file needs to be created.
