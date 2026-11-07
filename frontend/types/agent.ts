export interface ActionStep {
  step: number;
  instrument: string;
  action: string;
  quantity: string;
  target_price: string;
  rationale: string;
}

export interface IntelligenceSource {
  title: string;
  summary: string;
  source: string;
  score: number;
}

export interface AgentDecisionResponse {
  session_id: string;
  query: string;
  recommendation_title: string;
  executive_summary: string;
  action_type: string;
  risk_rating: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  confidence_score: number;
  recommended_hedge_ratio: number;
  calculated_margin_dollars_bu: number;
  cbot_orders: {
    bushels_crush_volume: number;
    hedge_ratio: number;
    hedged_bushels: number;
    contracts: {
      soybeans_zs: {
        action: string;
        contract_count: number;
        contract_size: string;
        exact_decimal: number;
      };
      soybean_meal_zm: {
        action: string;
        contract_count: number;
        contract_size: string;
        exact_decimal: number;
      };
      soybean_oil_zl: {
        action: string;
        contract_count: number;
        contract_size: string;
        exact_decimal: number;
      };
    };
    spread_ratio_rule: string;
  };
  action_steps: ActionStep[];
  intelligence_sources: IntelligenceSource[];
  execution_trace: string[];
  model_used: string;
}

