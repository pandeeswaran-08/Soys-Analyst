export interface MarketQuote {
  symbol: string;
  name: string;
  contract_month: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  open_interest: number;
  unit: string;
}

export interface BasisQuote {
  location_name: string;
  location_type: string;
  commodity: string;
  basis_cents: number;
  delivery_period: string;
  freight_rate_cents: number;
}

export interface MarketOverview {
  as_of: string;
  soybeans: MarketQuote[];
  meal: MarketQuote[];
  oil: MarketQuote[];
  basis_bids: BasisQuote[];
  board_crush_cents: number;
  board_crush_dollars: number;
  oil_share_pct: number;
}

export interface CrushCalculation {
  board_crush_cents_per_bu: number;
  board_crush_dollars_per_bu: number;
  cash_gpm_dollars_per_bu: number;
  net_processing_margin_dollars_per_bu: number;
  oil_share_percent: number;
  meal_share_percent: number;
  product_value_dollars_per_bu: number;
  meal_revenue_dollars_per_bu: number;
  oil_revenue_dollars_per_bu: number;
  raw_bean_cost_dollars_per_bu: number;
  operating_cost_dollars_per_bu: number;
  sensitivities: {
    delta_per_dollar_bean: number;
    delta_per_dollar_meal_ton: number;
    delta_per_cent_oil_lb: number;
    delta_per_dollar_oil_lb: number;
  };
}

export interface HistoricalPoint {
  date: string;
  soybean_price: number;
  meal_price: number;
  oil_price: number;
  board_crush_cents: number;
  board_crush_dollars: number;
  basis_interior: number;
  oil_share_pct: number;
}

