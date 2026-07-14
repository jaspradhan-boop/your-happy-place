import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("status, email, full_name").eq("id", data.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", data.user.id),
    ]);

    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    const status = profile?.status ?? "pending";

    return {
      user: data.user,
      profile,
      isAdmin,
      status,
    };
  },
  component: () => <Outlet />,
});
