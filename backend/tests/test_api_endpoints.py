"""
Unit and integration tests for FastAPI REST and Streaming endpoints and LangChain Tools.
Verifies:
- POST /calculate/landed-cost
- POST /forecast/price
- POST /inventory/safety-stock
- POST /timing-signal
- POST /scenario/stress-test
- POST /documents/upload
- POST /chat (streaming Server-Sent Events)
- LangChain math_core tools invocation
- Redis caching layer
"""

import pytest
import io
import json
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.tools.math_tools import ALL_MATH_CORE_TOOLS


@pytest.fixture
def client():
    return TestClient(app)


class TestMathEndpoints:
    def test_calculate_domestic_landed_cost_endpoint(self, client):
        """Verifies POST /calculate/landed-cost (Domestic) and Redis caching."""
        payload = {
            "channel": "DOMESTIC",
            "domestic": {
                "base_price_per_unit": 4900.0,
                "freight_per_unit": 180.0,
                "handling_per_unit": 35.0,
                "mandi_tax_rate": 0.015,
                "transit_insurance_rate": 0.001,
                "in_transit_shrinkage_rate": 0.003,
                "unloading_storage_per_unit": 20.0,
                "gst_rate": 0.05,
                "itc_eligible": True,
                "brokerage_commission_per_unit": 10.0,
            }
        }
        # First call: Cache miss
        res1 = client.post("/calculate/landed-cost", json=payload)
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1["channel"] == "DOMESTIC"
        assert data1["base_price_per_unit"] == 4900.0
        assert data1["_cached"] is False
        assert data1["total_landed_cost_per_unit"] > 5000.0

        # Second call: Cache hit from Redis/local cache
        res2 = client.post("/calculate/landed-cost", json=payload)
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2["_cached"] is True
        assert data2["total_landed_cost_per_unit"] == data1["total_landed_cost_per_unit"]

    def test_calculate_international_landed_cost_endpoint(self, client):
        """Verifies POST /calculate/landed-cost (International Import)."""
        payload = {
            "channel": "INTERNATIONAL",
            "international": {
                "fob_price_usd_per_mt": 960.0,
                "ocean_freight_usd_per_mt": 52.0,
                "exchange_rate_usd_to_inr": 85.5,
                "basic_customs_duty_rate": 0.05,
                "inland_transport_inr_per_mt": 1750.0,
            }
        }
        res = client.post("/calculate/landed-cost", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["channel"] == "INTERNATIONAL_IMPORT"
        assert "customs_breakdown_inr" in data
        assert data["totals"]["total_landed_cost_inr_per_mt"] > 80000.0
        assert data["totals"]["total_landed_cost_inr_per_quintal"] > 8000.0

    def test_forecast_price_endpoint(self, client):
        """Verifies POST /forecast/price with Holt-Winters uncertainty bands."""
        series = [4500.0, 4520.0, 4550.0, 4580.0, 4610.0, 4650.0, 4680.0,
                  4670.0, 4710.0, 4740.0, 4780.0, 4820.0, 4850.0, 4890.0,
                  4880.0, 4920.0, 4950.0, 4990.0, 5020.0, 5060.0, 5100.0]
        payload = {
            "series": series,
            "forecast_steps": 7,
            "seasonal_periods": 7,
            "trend": "add",
            "seasonal": "add",
            "confidence_level": 0.95,
            "auto_select": False,
        }
        res = client.post("/forecast/price", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert len(data["point_forecast"]) == 7
        assert len(data["lower_band"]) == 7
        assert len(data["upper_band"]) == 7
        # Upper band >= point forecast >= lower band
        for pt, low, up in zip(data["point_forecast"], data["lower_band"], data["upper_band"]):
            assert up >= pt >= low

    def test_inventory_safety_stock_endpoint(self, client):
        """Verifies POST /inventory/safety-stock."""
        payload = {
            "average_daily_demand": 75.0,
            "demand_std_dev": 12.0,
            "lead_time_days": 8.0,
            "lead_time_std_dev": 1.2,
            "service_level": 0.95,
        }
        res = client.post("/inventory/safety-stock", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["safety_stock_units"] > 0
        assert data["buffer_coverage_days"] > 0
        assert data["service_level_pct"] == 95.0

    def test_timing_signal_endpoint(self, client):
        """Verifies POST /timing-signal."""
        payload = {
            "current_price": 4850.0,
            "forecasted_prices": [4880.0, 4920.0, 4960.0, 5010.0, 5050.0],
            "target_cost_budget": 5000.0,
            "current_stock_days": 18.0,
            "reorder_threshold_days": 20.0,
        }
        res = client.post("/timing-signal", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["signal"] in ["BUY_AGGRESSIVE", "BUY_SCALE_IN", "WAIT_PRICE_DROP", "MONITOR_NEUTRAL", "BUY_MANDATORY"]
        assert len(data["rationales"]) > 0

    def test_scenario_stress_test_endpoint(self, client):
        """Verifies POST /scenario/stress-test."""
        payload = {
            "base_fob_usd_per_mt": 960.0,
            "base_ocean_freight_usd_per_mt": 50.0,
            "base_exchange_rate_usd_to_inr": 85.0,
            "base_customs_duty_rate": 0.05,
            "base_domestic_price_per_mt": 48000.0,
            "base_domestic_freight_per_mt": 1700.0,
            "inr_depreciation_pct": 5.0,
            "ocean_freight_shock_pct": 30.0,
            "customs_duty_hike_pct_points": 5.0,
            "weather_impact": "MODERATE_DROUGHT",
        }
        res = client.post("/scenario/stress-test", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "baseline_summary" in data
        assert "isolated_stress_sensitivities" in data
        assert "combined_stress_scenario" in data

    def test_documents_upload_raw_content(self, client):
        """Verifies POST /documents/upload using form content."""
        data = {
            "title": "USDA Oilseeds World Markets and Trade",
            "raw_content": "Global soybean crush projected higher for marketing year 2024/25. Argentine meal exports expanding while Brazilian harvest completes.",
            "source": "USDA FAS",
        }
        res = client.post("/documents/upload", data=data)
        assert res.status_code == 200
        resp_data = res.json()
        assert resp_data["status"] == "INDEXED"
        assert resp_data["chunks_indexed"] >= 1

    def test_documents_upload_file(self, client):
        """Verifies POST /documents/upload using multipart file upload."""
        file_content = b"Central Illinois river barge freight rates traded at 380 percent of tariff."
        files = {"file": ("freight_report.txt", io.BytesIO(file_content), "text/plain")}
        res = client.post("/documents/upload", files=files)
        assert res.status_code == 200
        resp_data = res.json()
        assert resp_data["status"] == "INDEXED"

    def test_chat_streaming_sse_endpoint(self, client):
        """Verifies POST /chat streaming Server-Sent Events."""
        payload = {
            "message": "Should we buy soybeans now given the domestic landed cost?",
            "session_id": "test-session-sse",
            "stream": True,
        }
        response = client.post("/chat", json=payload)
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")

        # Parse SSE events from response text
        lines = response.text.split("\n\n")
        events = []
        for line in lines:
            if line.startswith("data: "):
                try:
                    events.append(json.loads(line[6:]))
                except Exception:
                    pass

        assert len(events) >= 5
        event_types = [e.get("event") for e in events]
        assert "start" in event_types
        assert "tool_call" in event_types
        assert "tool_result" in event_types
        assert "token" in event_types
        assert "done" in event_types


class TestLangChainTools:
    def test_all_math_core_tools_registered(self):
        """Verifies all math_core functions are exposed as valid LangChain tools."""
        assert len(ALL_MATH_CORE_TOOLS) == 10
        tool_names = [t.name for t in ALL_MATH_CORE_TOOLS]

        expected_names = [
            "calculate_domestic_landed_cost_tool",
            "calculate_international_landed_cost_tool",
            "forecast_price_tool",
            "auto_forecast_price_tool",
            "calculate_safety_stock_tool",
            "calculate_reorder_point_tool",
            "calculate_economic_order_quantity_tool",
            "evaluate_inventory_position_tool",
            "generate_timing_signal_tool",
            "stress_test_procurement_tool",
        ]

        for name in expected_names:
            assert name in tool_names

    def test_invoke_domestic_landed_cost_tool(self):
        """Tests calling tool.invoke via LangChain interface."""
        tool = next(t for t in ALL_MATH_CORE_TOOLS if t.name == "calculate_domestic_landed_cost_tool")
        res = tool.invoke({"base_price_per_unit": 4850.0, "freight_per_unit": 180.0})
        assert res["channel"] == "DOMESTIC"
        assert res["base_price_per_unit"] == 4850.0
        assert res["total_landed_cost_per_unit"] > 4850.0

    def test_invoke_safety_stock_tool(self):
        """Tests calling calculate_safety_stock_tool via LangChain."""
        tool = next(t for t in ALL_MATH_CORE_TOOLS if t.name == "calculate_safety_stock_tool")
        res = tool.invoke({"average_daily_demand": 100.0, "demand_std_dev": 15.0, "lead_time_days": 9.0})
        assert res["safety_stock_units"] > 70.0

    def test_invoke_timing_signal_tool(self):
        """Tests calling generate_timing_signal_tool via LangChain."""
        tool = next(t for t in ALL_MATH_CORE_TOOLS if t.name == "generate_timing_signal_tool")
        res = tool.invoke({
            "current_price": 4850.0,
            "forecasted_prices": [4900.0, 4950.0, 5000.0],
            "target_cost_budget": 5000.0,
            "current_stock_days": 18.0,
        })
        assert res["signal"] in ["BUY_AGGRESSIVE", "BUY_SCALE_IN", "WAIT_PRICE_DROP", "MONITOR_NEUTRAL", "BUY_MANDATORY"]
