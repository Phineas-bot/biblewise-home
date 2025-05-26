import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming this is for general OPTIONS handling, not strictly needed by Stripe webhooks
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@11.1.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// This is your Stripe CLI webhook secret for testing locally.
// In production, set this in your Supabase function's environment variables.
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text(); // Stripe requires the raw body

  let event: Stripe.Event;

  try {
    if (!signature) {
      throw new Error('Missing Stripe-Signature header');
    }
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret,
      undefined, // Timestamp tolerance
      Stripe.createSubtleCryptoProvider() // Deno specific for WebCrypto
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(err.message, { status: 400 });
  }

  // console.log('Received Stripe event:', event.type, event.id);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Processing checkout.session.completed for session ID: ${session.id}`);

        if (session.payment_status === 'paid') {
          const userId = session.metadata?.supabase_user_id;
          const stripeCustomerId = session.customer as string; // Should be a string

          if (!userId) {
            console.error('Error: Missing supabase_user_id in session metadata.');
            return new Response('Missing user ID in session metadata.', { status: 400 });
          }

          if (session.mode === 'payment') {
            // Handle one-time purchase
            const paymentIntentId = session.payment_intent as string;
            const courseId = session.metadata?.course_id; // From create-checkout-session

            // Fetch the "Single Course Purchase" product from DB
            const { data: product, error: productError } = await supabaseAdmin
              .from('products')
              .select('id, price') // Select product ID and price
              .eq('name', 'Single Course Purchase') // Or use a more specific identifier
              .single();

            if (productError || !product) {
              console.error('Error fetching single course product:', productError);
              return new Response('Product not found for single course purchase.', { status: 500 });
            }

            const purchaseData = {
              user_id: userId,
              product_id: product.id,
              course_id: courseId || null, // Store courseId if available
              stripe_payment_intent_id: paymentIntentId,
              stripe_customer_id: stripeCustomerId,
              amount: session.amount_total || product.price, // amount_total from session is preferred
              currency: session.currency?.toLowerCase() || 'usd',
              status: 'succeeded',
            };

            const { error: purchaseError } = await supabaseAdmin
              .from('purchases')
              .insert(purchaseData);

            if (purchaseError) {
              console.error('Error inserting purchase:', purchaseError);
              return new Response('Failed to record purchase.', { status: 500 });
            }
            console.log(`Purchase recorded for user ${userId}, PI_ID: ${paymentIntentId}`);

          } else if (session.mode === 'subscription') {
            // Handle new subscription
            const subscriptionId = session.subscription as string;
            
            // Retrieve the full subscription object to get all details
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            if (!subscription) {
                console.error(`Error: Could not retrieve subscription ${subscriptionId} from Stripe.`);
                return new Response('Subscription not found in Stripe.', { status: 500 });
            }
            
            const priceId = subscription.items.data[0]?.price.id;

            // Fetch the corresponding product from your DB based on the Stripe Price ID
            const { data: product, error: productError } = await supabaseAdmin
              .from('products')
              .select('id') // Select product ID
              .eq('stripe_price_id', priceId)
              .single();

            if (productError || !product) {
              console.error('Error fetching subscription product by price_id:', priceId, productError);
              return new Response('Product not found for subscription.', { status: 500 });
            }
            
            const subscriptionData = {
              user_id: userId,
              product_id: product.id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: stripeCustomerId,
              status: subscription.status, // e.g., 'active', 'trialing'
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              metadata: subscription.metadata,
            };

            const { error: subError } = await supabaseAdmin
              .from('subscriptions')
              .insert(subscriptionData);

            if (subError) {
              console.error('Error inserting subscription:', subError);
              // Consider how to handle this: retry, alert, etc.
              // If Stripe subscription was created but DB insert fails, there's an inconsistency.
              return new Response('Failed to record subscription.', { status: 500 });
            }
            console.log(`Subscription recorded for user ${userId}, Sub_ID: ${subscription.id}`);
          }
        } else {
          console.log(`Checkout session ${session.id} payment_status is ${session.payment_status}, not processing.`);
        }
        break;
      }
      // TODO: Handle other relevant events in the future:
      // case 'invoice.paid':
      //   // Used for recurring payments, etc.
      //   // Update subscription current_period_start, current_period_end, status
      //   break;
      // case 'invoice.payment_failed':
      //   // Handle failed payments, update subscription status
      //   break;
      // case 'customer.subscription.updated':
      // case 'customer.subscription.deleted':
      // case 'customer.subscription.resumed': // Stripe CLI might send this
      //   // Update subscription status in your DB
      //   break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing webhook event:', event.type, error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error during webhook processing.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// To deploy:
// supabase functions deploy stripe-webhook-handler
// Remember to set STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// and STRIPE_WEBHOOK_SIGNING_SECRET in your Supabase project's Edge Function environment variables.
// Also, configure the webhook endpoint in your Stripe Dashboard to point to this function's URL.
// e.g., https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook-handler
// console.log('Stripe webhook handler is up!');
