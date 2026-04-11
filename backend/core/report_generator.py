"""Report generation: PDF and CSV exports."""
import csv
from pathlib import Path
from datetime import datetime


def generate_pdf(results: dict, assignment_name: str, output_path: str):
    """Generate a PDF report using reportlab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Table, TableStyle, Paragraph,
            Spacer, HRFlowable
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm

        doc = SimpleDocTemplate(output_path, pagesize=A4,
                                topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle('Title', parent=styles['Heading1'],
                                     fontSize=18, spaceAfter=6,
                                     textColor=colors.HexColor('#1d4ed8'))
        story.append(Paragraph(f"Code Quality & Plagiarism Report", title_style))
        story.append(Paragraph(f"Assignment: {assignment_name}", styles['Heading2']))
        story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 0.5*cm))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.lightblue))
        story.append(Spacer(1, 0.5*cm))

        # Summary
        students = results.get("students", [])
        quality = results.get("quality", {})
        similarity = results.get("similarity_matrix", {})

        # Build student rows
        rows = _build_student_rows(students, quality, similarity)

        story.append(Paragraph("Student Summary", styles['Heading2']))
        story.append(Spacer(1, 0.3*cm))

        table_data = [["Student Name", "Quality Score", "Plagiarism Risk %", "Complexity", "Issues"]]
        for row in rows:
            table_data.append([
                row["name"],
                f"{row['quality_score']}/100",
                f"{row['max_sim']}%",
                str(row['complexity']),
                str(row['bug_count']),
            ])

        t = Table(table_data, colWidths=[4*cm, 3*cm, 4*cm, 3*cm, 2.5*cm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1d4ed8')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#eff6ff')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.5*cm))

        # Similarity matrix section
        if similarity:
            story.append(Paragraph("Similarity Matrix (High Risk Pairs)", styles['Heading2']))
            story.append(Spacer(1, 0.2*cm))
            sim_data = [["Student A", "Student B", "AST Sim", "Token Sim", "Embed Sim", "Combined"]]
            for key, val in similarity.items():
                if val.get("combined", 0) >= 0.4:
                    a, b = key.split("||")
                    sim_data.append([
                        a, b,
                        f"{val.get('ast', 0)*100:.1f}%",
                        f"{val.get('token', 0)*100:.1f}%",
                        f"{val.get('embedding', 0)*100:.1f}%",
                        f"{val.get('combined', 0)*100:.1f}%",
                    ])
            if len(sim_data) > 1:
                t2 = Table(sim_data, colWidths=[3*cm, 3*cm, 2*cm, 2.5*cm, 2.5*cm, 2.5*cm])
                t2.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fef2f2')]),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
                ]))
                story.append(t2)

        doc.build(story)
    except ImportError:
        # Fallback: write a simple text PDF placeholder
        Path(output_path).write_text(f"Report for {assignment_name}\nGenerated: {datetime.now()}\nStudents: {results.get('students', [])}")


def generate_csv(results: dict, output_path: str):
    """Generate a CSV report."""
    students = results.get("students", [])
    quality = results.get("quality", {})
    similarity = results.get("similarity_matrix", {})
    rows = _build_student_rows(students, quality, similarity)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Student Name", "Language", "Quality Score", "Plagiarism Risk %",
            "Cyclomatic Complexity", "Avg Function Length", "Comment Density %",
            "Total Lines", "Bug Count"
        ])
        for row in rows:
            writer.writerow([
                row["name"],
                row["language"],
                row["quality_score"],
                row["max_sim"],
                row["complexity"],
                row["avg_func_len"],
                row["comment_density"],
                row["total_lines"],
                row["bug_count"],
            ])


def _build_student_rows(students: list, quality: dict, similarity: dict) -> list:
    """Build a list of row dicts for each student."""
    rows = []
    for name in students:
        q = quality.get(name, {})
        # Find highest similarity with any peer
        max_sim = 0
        for key, val in similarity.items():
            parts = key.split("||")
            if name in parts:
                sim = val.get("combined", 0)
                if sim > max_sim:
                    max_sim = sim

        rows.append({
            "name": name,
            "language": q.get("language", "unknown"),
            "quality_score": q.get("quality_score", 0),
            "max_sim": round(max_sim * 100, 1),
            "complexity": q.get("cyclomatic_complexity", 0),
            "avg_func_len": q.get("avg_function_length", 0),
            "comment_density": q.get("comment_density", 0),
            "total_lines": q.get("total_lines", 0),
            "bug_count": len(q.get("bugs", [])),
        })

    # Sort by plagiarism risk desc
    rows.sort(key=lambda r: r["max_sim"], reverse=True)
    return rows
