"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileText, 
  ListOrdered,
  Cpu
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { runAgentDecision } from "@/lib/api";
import { AgentDecisionResponse } from "@/types/agent";

export default function AgentDecisionDeskPage() {
  const [query, setQuery] = useState(
    "Decatur plant crush margins are currently strong at $1.52/bu. Given rising Mississippi River barge tariffs and the upcoming USDA crop report, should we execute a 75% synthetic crush hedge now?"
  );
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<AgentDecisionResponse | null>(null);

  const presets = [
    "Decatur crush margins are at $1.52/bu. Should we lock 75% now or defer hedging?",
    "How do high Mississippi River barge freight tariffs affect our Decatur cash basis vs Gulf export?",
    "Evaluate downside crush risks under a 20% South American crop expansion scenario.",
  ];

  async function handleRun(customQuery?: string) {
    const q = customQuery || query;
    setLoading(true);
    try {
      const res = await runAgentDecision(q);
      setDecision(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-xl glass-card border border-[var(--border)]">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-[#10A37F]" />
          Autonomous Hedging & Trading Strategist
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Autonomous multi-agent architecture powered by quantitative reasoning models, vector intelligence, and pure Python math tools.
        </p>
      </div>

      {/* Query Input Card */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center justify-between">
            Trader Decision Inquiry
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">
              StateGraph &bull; Active
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)]">
            Submit an operational hedging, crush spread, or basis question
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5 pt-4">
          <div className="flex gap-2">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#10A37F]/30 resize-none font-sans"
              placeholder="Enter trading inquiry..."
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(p);
                  handleRun(p);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--text-muted)] transition-colors text-left truncate max-w-xs"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => handleRun()}
              disabled={loading}
              className="bg-[#10A37F] hover:bg-[#0D8A6D] text-white text-xs px-6 h-9 font-semibold shadow-sm"
            >
              {loading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Running Execution Workflow...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Execute Agent Decision
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Decision Output Section */}
      {decision && (
        <div className="space-y-6">
          {/* Executive Recommendation Banner */}
          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[#10A37F]/30 glass-card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs font-mono uppercase tracking-wider">
                  {decision.action_type}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono tabular-nums text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">
                  Confidence: {Math.round(decision.confidence_score * 100)}%
                </Badge>
                <Badge variant="amber" className="text-xs font-mono uppercase tracking-wider">
                  Risk: {decision.risk_rating}
                </Badge>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Engine: {decision.model_used}
              </span>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-[var(--text)]">
              {decision.recommendation_title}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text)] leading-relaxed max-w-4xl">
              {decision.executive_summary}
            </p>
          </div>

          {/* Action Plan & Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actionable Steps (2 cols) */}
            <Card className="lg:col-span-2 glass-card border-[var(--border)]">
              <CardHeader className="pb-3 border-b border-[var(--border)]">
                <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-[#10A37F]" />
                  Actionable Execution Tickets
                </CardTitle>
                <CardDescription className="text-xs text-[var(--text-muted)]">
                  Step-by-step instrument allocation and price targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {decision.action_steps.map((step) => (
                  <div
                    key={step.step}
                    className="p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#10A37F]/10 text-[#10A37F] flex items-center justify-center text-xs font-mono font-bold">
                          {step.step}
                        </span>
                        <span className="font-semibold text-xs text-[var(--text)]">
                          {step.action} {step.instrument}
                        </span>
                      </div>
                      <Badge variant="secondary" className="font-mono tabular-nums text-[11px]">
                        Target: {step.target_price}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-[var(--text-muted)]">Quantity: <strong className="text-[var(--text)] font-mono tabular-nums">{step.quantity}</strong></span>
                      <span className="text-[11px] text-[var(--text-muted)] italic max-w-md text-right">{step.rationale}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Vector Intelligence Sources & Trace (1 col) */}
            <div className="space-y-6">
              {/* Vector Intelligence */}
              <Card className="glass-card border-[var(--border)]">
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#F5A623]" />
                    Vector Knowledge Intelligence
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--text-muted)]">
                    Retrieved USDA WASDE reports and market commentary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-xs">
                  {decision.intelligence_sources.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#10A37F] text-[11px] truncate">{doc.title}</span>
                        <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)]">Score: {Math.round(doc.score * 100)}%</span>
                      </div>
                      <p className="text-[var(--text-muted)] text-[11px] leading-relaxed line-clamp-3">
                        {doc.summary}
                      </p>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono block pt-0.5">Source: {doc.source}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Execution Trace */}
              <Card className="glass-card border-[var(--border)]">
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#10A37F]" />
                    Multi-Agent Execution Trace
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--text-muted)]">
                    Sequential node execution log
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1.5 font-mono text-[10px] text-[var(--text-muted)] bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)] max-h-48 overflow-y-auto pt-3">
                  {decision.execution_trace.map((step, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-[#10A37F] font-bold">&gt;</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

