import { useCallback, useEffect, useState } from "react";

export function useAsync(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await loader();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    run();
  }, [run]);

  return { data, error, loading, reload: run };
}
