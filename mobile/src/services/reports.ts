import { api } from "@/services/api";
import type { MonthlyReport } from "@/types/api";

export async function getMonthlyReport(
  month: number,
  year: number,
): Promise<MonthlyReport> {
  const response = await api.get<MonthlyReport>(
    "/reports/monthly",
    {
      params: {
        month,
        year,
      },
    },
  );

  return response.data;
}
// Keeps Axios calls outside the screen.
// Sends month and year as query parameters.
// Tells TypeScript the exact expected response.
// Returns only the response body.