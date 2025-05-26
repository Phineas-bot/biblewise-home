import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define input types for the function
interface PurchaseInput {
  item_id: string; // Can be course ID or plan identifier
  item_type: "course" | "subscription_plan";
  price_paid: number;
  currency: string; // e.g., "USD"
}

// Define the structure of the data to be inserted into the table
interface UserPurchaseRecord {
  user_id: string;
  item_id: string;
  item_type: "course" | "subscription_plan";
  price_paid: number;
  currency: string;
  purchase_status: "completed" | "pending" | "failed" | "refunded";
  purchase_date?: string; // Will be set by DB default if not provided
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  // created_at and updated_at will be handled by DB defaults
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Adjust for production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Helper function to create Supabase client with Auth context
// This is crucial for getting the user from the request.
const getSupabaseClientWithAuth = (req: Request, serviceRoleKey?: string): SupabaseClient => {
  const client = createClient(
    // Supabase API URL - Deno environment variables
    Deno.env.get("SUPABASE_URL") ?? "",
    // Supabase Anon Key for user context, or Service Role Key for admin actions
    serviceRoleKey ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    // Create client with Auth context from the request headers
    serviceRoleKey ? undefined : { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );
  return client;
};


serve(async (req: Request) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client to get user context
    // For Edge Functions, the user's JWT is passed in the Authorization header.
    const userClient = getSupabaseClientWithAuth(req);
    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      console.error("User retrieval error:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized: User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse input from request body
    const { item_id, item_type, price_paid, currency }: PurchaseInput = await req.json();

    // 3. Validate inputs
    if (!item_id || !item_type || price_paid === undefined || !currency) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (item_type !== "course" && item_type !== "subscription_plan") {
      return new Response(JSON.stringify({ error: "Invalid item_type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof price_paid !== "number" || price_paid <= 0) {
      return new Response(JSON.stringify({ error: "Invalid price_paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Prepare data for insertion
    const purchaseData: UserPurchaseRecord = {
      user_id: user.id,
      item_id,
      item_type,
      price_paid,
      currency,
      purchase_status: "completed", // Simulate successful payment
      // purchase_date, created_at, updated_at will use DB defaults (NOW())
    };

    // Calculate subscription dates if item_type is 'subscription_plan'
    if (item_type === "subscription_plan") {
      const now = new Date();
      purchaseData.subscription_start_date = now.toISOString();

      if (item_id.includes("monthly")) {
        const endDate = new Date(now.setMonth(now.getMonth() + 1));
        purchaseData.subscription_end_date = endDate.toISOString();
      } else if (item_id.includes("annual")) {
        const endDate = new Date(now.setFullYear(now.getFullYear() + 1));
        purchaseData.subscription_end_date = endDate.toISOString();
      } else {
        // Default or unknown subscription plan duration, maybe set to a fixed period or handle as error
        // For now, let's set a generic 30-day period if not specified as monthly/annual
        const endDate = new Date(now.setDate(now.getDate() + 30));
        purchaseData.subscription_end_date = endDate.toISOString();
        console.warn(`Subscription item_id '${item_id}' did not match 'monthly' or 'annual'. Defaulting to 30 days.`);
      }
    } else {
      purchaseData.subscription_start_date = null;
      purchaseData.subscription_end_date = null;
    }

    // 5. Insert into user_purchases table
    // IMPORTANT: Use the Service Role Key for backend operations like this
    // to bypass RLS if necessary, or ensure your RLS policies allow this insertion.
    // For this function, we assume it needs to write directly.
    const adminClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: newPurchase, error: insertError } = await adminClient
      .from("user_purchases")
      .insert(purchaseData)
      .select("id") // Select the ID of the newly created record
      .single(); // Expect a single record to be returned

    if (insertError) {
      console.error("Database insert error:", insertError.message);
      return new Response(JSON.stringify({ error: "Failed to record purchase", details: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Return success response
    return new Response(JSON.stringify({ message: "Purchase recorded successfully", purchaseId: newPurchase.id }), {
      status: 201, // 201 Created
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unhandled error:", error.message);
    return new Response(JSON.stringify({ error: "An unexpected error occurred", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/*
Deployment Instructions for Supabase Edge Function:

1.  **Install Supabase CLI:** If you haven't already, install the Supabase CLI:
    `npm install supabase --save-dev` (or globally `npm install -g supabase`)

2.  **Login to Supabase CLI:**
    `supabase login`
    Follow the prompts to authenticate with your Supabase account.

3.  **Link your project:** Navigate to your local project root (where your `supabase` directory is).
    `supabase link --project-ref YOUR_PROJECT_ID`
    You can find `YOUR_PROJECT_ID` in your Supabase project's dashboard URL (e.g., `https://app.supabase.com/project/YOUR_PROJECT_ID`).

4.  **Set Environment Variables (Important for Edge Functions):**
    Edge Functions need access to your Supabase URL and specific API keys.
    These should be set as secrets for your function:
    `supabase secrets set SUPABASE_URL=your_supabase_url`
    `supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key`
    `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key`
    You can find these keys in your Supabase project dashboard under Project Settings > API.
    *   `SUPABASE_URL`: Your project's API URL.
    *   `SUPABASE_ANON_KEY`: The public anonymous key.
    *   `SUPABASE_SERVICE_ROLE_KEY`: The secret service role key (use with caution, grants admin-like privileges).

5.  **Deploy the function:**
    `supabase functions deploy record-purchase`
    (This deploys only the `record-purchase` function. To deploy all functions: `supabase functions deploy`)

6.  **Verify Deployment:**
    Check your Supabase project dashboard under Edge Functions. You should see `record-purchase` listed, and you can view logs there.

7.  **Invoking the function (from client-side JS/TS):**
    ```typescript
    import { supabase } from './supabaseClient'; // Your regular Supabase client

    async function makePurchase() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error("No active session, user needs to log in.");
        return;
      }

      const purchaseDetails = {
        item_id: "course_101",
        item_type: "course",
        price_paid: 19.99,
        currency: "USD",
      };

      const { data, error } = await supabase.functions.invoke("record-purchase", {
        body: purchaseDetails,
        // The JWT token is automatically included by the JS client if the user is logged in
      });

      if (error) {
        console.error("Error invoking function:", error);
      } else {
        console.log("Function returned:", data);
        // data should be: { message: "Purchase recorded successfully", purchaseId: NEW_ID }
      }
    }
    ```

**Security Considerations for this Edge Function:**
- The function correctly retrieves `user_id` from the authenticated session (`userClient.auth.getUser()`), not from client input. This is good.
- It uses the `SUPABASE_SERVICE_ROLE_KEY` for the database insertion (`adminClient`). This key bypasses RLS, which is often necessary for such backend operations. Ensure that your RLS policies for `user_purchases` are set up with the understanding that this function will write with admin privileges. If you wanted the function to respect RLS for the user performing the insert (e.g., an RLS policy that checks `auth.uid() = user_id` for INSERT), you would use `userClient` for the insert operation, but this usually requires more complex RLS setups for tables modified by backend processes.
- Input validation is present, which is crucial.
- CORS headers are included. For production, `Access-Control-Allow-Origin` should be restricted to your application's domain.
*/
