/**
 * Fetches the tax rates from the Platform Settings table (admin) via GET /order/tax-rates.
 * Checkout must use these values – and only these – to calculate VAT, NHIL and GETFund.
 */
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderApi';

const TAX_RATES_QUERY_KEY = ['platform', 'taxRates'];

export function usePlatformTaxRates(options = {}) {
  const query = useQuery({
    queryKey: TAX_RATES_QUERY_KEY,
    queryFn: async () => {
      const data = await orderService.getTaxRates();
      // Support both { data: { taxRates } } and { taxRates }
      const raw = data?.data?.taxRates ?? data?.taxRates ?? null;
      if (!raw || typeof raw !== 'object') return null;
      // Normalize: backend sends decimals (0.15 = 15%); if stored as whole number (15) convert to 0.15
      const toRate = (v) => {
        if (v == null || v === '') return undefined;
        const n = Number(v);
        if (Number.isNaN(n)) return undefined;
        return n > 1 ? n / 100 : n;
      };
      // Only use fallback when API did not send the value (undefined/null) – not when value is 0
      const vat = toRate(raw.vatRate);
      const nhil = toRate(raw.nhilRate);
      const getfund = toRate(raw.getfundRate);
      return {
        vatRate: vat !== undefined ? vat : 0.125,
        nhilRate: nhil !== undefined ? nhil : 0.025,
        getfundRate: getfund !== undefined ? getfund : 0.025,
      };
    },
    staleTime: 0, // Always refetch so admin updates show immediately on checkout
    refetchOnMount: 'always',
    ...options,
  });

  const taxRates = query.data ?? null;

  /**
   * Compute tax using only the values from platform settings (VAT, NHIL, GETFund).
   * Rates come from GET /order/tax-rates (same as Platform Settings table in admin).
   * @param {number} vatInclusiveAmount - Amount that already includes VAT+NHIL+GETFund
   * @returns {{ basePrice, vat, nhil, getfund, totalTax }}
   */
  const computeTaxBreakdown = (vatInclusiveAmount) => {
    if (!vatInclusiveAmount || vatInclusiveAmount <= 0) {
      return { basePrice: 0, vat: 0, nhil: 0, getfund: 0, totalTax: 0 };
    }
    // Platform values only (fallbacks only if API omits a rate)
    const vatRate = taxRates?.vatRate ?? 0.125;
    const nhilRate = taxRates?.nhilRate ?? 0.025;
    const getfundRate = taxRates?.getfundRate ?? 0.025;

    const totalVATRate = vatRate + nhilRate + getfundRate;
    const vatInclusiveFactor = 1 + totalVATRate;
    const basePrice = vatInclusiveAmount / vatInclusiveFactor;

    const vat = basePrice * vatRate;
    const nhil = basePrice * nhilRate;
    const getfund = basePrice * getfundRate;
    const totalTax = vat + nhil + getfund;

    const round = (n) => Math.round(n * 100) / 100;

    return {
      basePrice: round(basePrice),
      vat: round(vat),
      nhil: round(nhil),
      getfund: round(getfund),
      totalTax: round(totalTax),
    };
  };

  return {
    taxRates,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    computeTaxBreakdown,
  };
}
