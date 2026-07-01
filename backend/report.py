import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime

os.makedirs("static", exist_ok=True)
os.makedirs("reports", exist_ok=True)

BAR_PATH = "static/bar_chart.png"
PIE_PATH = "static/pie_chart.png"
LINE_PATH = "static/line_chart.png"


def generate_charts(breakdown_raw: dict, monthly: dict) -> dict:
    # Bar chart - emission sources
    plt.figure(figsize=(5, 4))
    plt.bar(breakdown_raw.keys(), breakdown_raw.values(), color="#2e8b57")
    plt.title("Emission Breakdown (kg CO2)")
    plt.ylabel("kg CO2")
    plt.tight_layout()
    plt.savefig(BAR_PATH)
    plt.close()

    # Pie chart - percentage share
    plt.figure(figsize=(5, 4))
    plt.pie(breakdown_raw.values(), labels=breakdown_raw.keys(), autopct="%1.1f%%")
    plt.title("Emission Share")
    plt.tight_layout()
    plt.savefig(PIE_PATH)
    plt.close()

    # Line chart - monthly trend
    plt.figure(figsize=(6, 4))
    months = list(monthly["monthly_prediction"].keys())
    values = list(monthly["monthly_prediction"].values())
    plt.plot(months, values, marker="o", color="#1f77b4")
    plt.title("Monthly Carbon Footprint Trend")
    plt.ylabel("kg CO2")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(LINE_PATH)
    plt.close()

    return {"bar_chart": BAR_PATH, "pie_chart": PIE_PATH, "line_chart": LINE_PATH}


def generate_pdf_report(record_id, prediction: float, score: float, category: str,
                         insights: dict, recommendations: list, charts: dict) -> str:
    path = f"reports/report_{record_id}.pdf"
    doc = SimpleDocTemplate(path, pagesize=A4)
    styles = getSampleStyleSheet()
    flow = [
        Paragraph("CarbonCast - Carbon Footprint Report", styles["Title"]),
        Paragraph(f"Generated: {datetime.utcnow().isoformat()}", styles["Normal"]),
        Spacer(1, 12),
        Paragraph(f"Predicted Annual Footprint: {prediction:.2f} kg CO2", styles["Heading2"]),
        Paragraph(f"Carbon Score: {score:.2f} / 100", styles["Normal"]),
        Paragraph(f"Category: {category}", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("Insights", styles["Heading2"]),
        Paragraph(f"Highest emission source: {insights['highest_emission_source']}", styles["Normal"]),
        Paragraph(f"Lowest emission source: {insights['lowest_emission_source']}", styles["Normal"]),
        Paragraph(f"Average emission: {insights['average_emission']} kg CO2", styles["Normal"]),
        Spacer(1, 12),
        Paragraph("Recommendations", styles["Heading2"]),
        ListFlowable([ListItem(Paragraph(r, styles["Normal"])) for r in recommendations], bulletType="bullet"),
        Spacer(1, 12),
        Paragraph("Charts", styles["Heading2"]),
    ]
    for chart_path in charts.values():
        if os.path.exists(chart_path):
            flow.append(Image(chart_path, width=350, height=280))
            flow.append(Spacer(1, 12))
    doc.build(flow)
    return path
