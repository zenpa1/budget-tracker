import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase.from("budgets").select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return (
    <div style={{ padding: 20 }}>
      <h1>Supabase Test Page</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  );
}
