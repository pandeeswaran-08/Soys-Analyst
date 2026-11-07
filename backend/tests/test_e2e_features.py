"""
End-to-End integration tests for SoyDecision Desk:
- Role-Based Access Control (RBAC: Viewer, Analyst, Admin)
- Full Audit Trail Logging for math_core routines
- Document upload RBAC restrictions
- Excel/CSV recommendation export endpoint
- Printable PDF/HTML memo export endpoint
- Zero hallucination numerical verification
"""

import io
import csv
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

root_dir = Path(__file__).resolve().parents[2]
if str(root_dir / "backend") not in sys.path:
    sys.path.insert(0, str(root_dir / "backend"))
if str(root_dir / "agent") not in sys.path:
    sys.path.insert(0, str(root_dir / "agent"))

from app.main import app
from app.core.audit_service import audit_service


@pytest.fixture
def client():
    return TestClient(app)


class TestE2EFeatures:
    def test_rbac_document_upload_restriction(self, client):
        """Verifies Viewer is blocked from document upload (403), while Analyst/Admin can upload."""
        payload = {"title": "Restricted Intelligence Report", "raw_content": "Crush margin projections for Q4."}

        # 1. Viewer Role: Must be rejected with HTTP 403
        res_viewer = client.post("/documents/upload", data=payload, headers={"X-User-Role": "Viewer"})
        assert res_viewer.status_code == 403
        assert "not authorized" in res_viewer.json()["detail"].lower()

        # 2. Analyst Role: Must succeed with HTTP 200
        res_analyst = client.post("/documents/upload", data=payload, headers={"X-User-Role": "Analyst"})
        assert res_analyst.status_code == 200
        assert res_analyst.json()["status"] == "INDEXED"

        # 3. Admin Role: Must succeed with HTTP 200
        res_admin = client.post("/documents/upload", data=payload, headers={"X-User-Role": "Admin"})
        assert res_admin.status_code == 200
        assert res_admin.json()["status"] == "INDEXED"

    def test_audit_logs_recording_and_retrieval(self, client):
        """Verifies calculation endpoints automatically record immutable audit events."""
        # Execute domestic landed cost calculation
        client.post(
            "/calculate/landed-cost",
            json={"channel": "DOMESTIC", "domestic": {"base_price_per_unit": 4920.0}},
            headers={"X-User-Role": "Analyst"}
        )

        # Retrieve audit logs
        res = client.get("/audit/logs?limit=10")
        assert res.status_code == 200
        logs = res.json()
        assert len(logs) > 0

        # Check most recent log
        latest = logs[0]
        assert "module" in latest
        assert "action" in latest
        assert "safety_guard_status" in latest
        assert latest["safety_guard_status"] == "PASSED"

    def test_audit_logs_purge_rbac(self, client):
        """Verifies only Admin role can purge audit logs."""
        # 1. Viewer cannot delete (403)
        res_view = client.delete("/audit/logs", headers={"X-User-Role": "Viewer"})
        assert res_view.status_code == 403

        # 2. Analyst cannot delete (403)
        res_ana = client.delete("/audit/logs", headers={"X-User-Role": "Analyst"})
        assert res_ana.status_code == 403

        # 3. Admin can delete (200)
        res_adm = client.delete("/audit/logs", headers={"X-User-Role": "Admin"})
        assert res_adm.status_code == 200
        assert res_adm.json()["status"] == "cleared"

    def test_excel_export_endpoint(self, client):
        """Verifies /export/excel returns formatted CSV file with Content-Disposition header."""
        export_payload = {
            "title": "Board Recommendation - Soybeans",
            "domestic_price": 4900.0,
            "domestic_landed_cost": 5238.64,
            "import_landed_cost": 10043.78,
            "signal": "BUY_AGGRESSIVE",
            "action": "PROCURE_FULL_ALLOCATION",
            "urgency": "HIGH",
            "current_stock": 360.0,
            "reorder_point": 393.52,
            "safety_stock": 43.52,
            "forecast_7d": 5210.0,
        }
        res = client.post("/export/excel", json=export_payload)
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "attachment; filename=" in res.headers["content-disposition"]
        
        # Verify content contains key numbers
        content = res.text
        assert "SOYDECISION DESK" in content
        assert "BUY_AGGRESSIVE" in content
        assert "5238.64" in content
        assert "10043.78" in content
        assert "NumericalSafetyGuard" in content

    def test_pdf_memo_export_endpoint(self, client):
        """Verifies /export/pdf returns printable HTML memo with executive layout and CSS."""
        export_payload = {
            "title": "Executive Procurement Memo",
            "domestic_price": 4900.0,
            "domestic_landed_cost": 5238.64,
            "import_landed_cost": 10043.78,
            "signal": "BUY_AGGRESSIVE",
            "action": "PROCURE_FULL_ALLOCATION",
            "urgency": "HIGH",
            "current_stock": 360.0,
            "reorder_point": 393.52,
            "safety_stock": 43.52,
            "forecast_7d": 5210.0,
        }
        res = client.post("/export/pdf", json=export_payload)
        assert res.status_code == 200
        assert "text/html" in res.headers["content-type"]
        assert "attachment; filename=" in res.headers["content-disposition"]
        
        html = res.text
        assert "SOYDECISION DESK" in html
        assert "EXECUTIVE PROCUREMENT MEMORANDUM" in html.upper()
        assert "@media print" in html
        assert "5,238.64" in html or "5238.64" in html
        assert "100% GROUNDED" in html

