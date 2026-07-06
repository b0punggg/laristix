"use client";

import { useEffect, useMemo, useState } from "react";
import { useMyOrdersQuery } from "@/hooks/use-my-orders";
import { getPreferredCity } from "@/lib/preferred-city";
import { useAuthStore } from "@/stores/auth-store";

export function usePreferredCity() {
  const user = useAuthStore((state) => state.user);
  const [storedCity, setStoredCity] = useState<string | null>(null);
  const ordersQuery = useMyOrdersQuery(1, 10, Boolean(user));

  useEffect(() => {
    setStoredCity(getPreferredCity());
  }, []);

  const cityFromOrders = useMemo(() => {
    for (const order of ordersQuery.data?.data ?? []) {
      const city = order.event?.venue?.city?.trim();
      if (city) {
        return city;
      }
    }

    return null;
  }, [ordersQuery.data?.data]);

  return storedCity ?? cityFromOrders;
}
