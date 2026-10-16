export interface SalesTotals {
  soldPrice: number;
  profit: number;
  markup: number;
  margin: number;
}

const cents = (n: number) => Math.round(n * 100) / 100;

/** Several sales as one: markup and margin come from the summed totals (like the database), not averaged. */
export function combineSales(
  sales: readonly { soldPrice: number; profit: number; costBasis: number }[],
): SalesTotals {
  const soldPrice = cents(sales.reduce((n, s) => n + s.soldPrice, 0));
  const profit = cents(sales.reduce((n, s) => n + s.profit, 0));
  const cost = cents(sales.reduce((n, s) => n + s.costBasis, 0));

  return {
    soldPrice,
    profit,
    markup: cost > 0 ? profit / cost : 0,
    margin: soldPrice > 0 ? profit / soldPrice : 0,
  };
}
