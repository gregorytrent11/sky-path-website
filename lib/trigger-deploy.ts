import { supabase } from "@/lib/supabase/client";

// Fire-and-forget: asks the trigger-deploy Edge Function to kick a GitHub
// Pages rebuild so a newly published/hidden/deleted dog or event gets its
// own static page shell without waiting on the 6-hour cron fallback.
// Failures here shouldn't block whatever admin action triggered it.
export function triggerDeploy() {
  supabase.functions.invoke("trigger-deploy").catch(() => {});
}
