"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestClient() {
  const [data, setData] = useState<any[] | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("budgets").select("*");
      console.log(data);
      setData(data);
    }
    load();
  }, []);

  return (
    <div>
      <h1>Client Test</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
