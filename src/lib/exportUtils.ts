import { ScanItem, InsightItem } from "../types";

// Generate Google Calendar Event Link
export function getGoogleCalendarLink(insight: InsightItem): string {
  const title = encodeURIComponent(insight.title);
  const details = encodeURIComponent(`${insight.subtitle}\n\nExtracted via Screenshot to Action AI`);
  const location = encodeURIComponent(insight.location || "");
  
  // Format date if available
  let datesParam = "";
  if (insight.date) {
    const today = new Date().toISOString().replace(/-|:|\.\d\d\d/g, "").substring(0, 8);
    datesParam = `&dates=${today}T090000Z/${today}T100000Z`;
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
}

// Download .ICS Calendar File
export function downloadIcsFile(insight: InsightItem) {
  const title = insight.title || "Calendar Event";
  const description = insight.subtitle || "Extracted via Screenshot to Action AI";
  const location = insight.location || "";
  
  const nowStr = new Date().toISOString().replace(/-|:|\.\d\d\d/g, "");
  
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Screenshot to Action AI//EN",
    "BEGIN:VEVENT",
    `UID:event-${Date.now()}@screenshotaction.app`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${nowStr}`,
    `DTEND:${nowStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Scan Insights to CSV
export function exportToCsv(scan: ScanItem) {
  const headers = ["ID", "Category", "Type", "Title", "Subtitle", "Date", "Time", "Location", "Amount", "Tracking Number", "Completed"];
  const rows = scan.insights.map((i) => [
    i.id,
    scan.category,
    i.type,
    `"${(i.title || "").replace(/"/g, '""')}"`,
    `"${(i.subtitle || "").replace(/"/g, '""')}"`,
    i.date || "",
    i.time || "",
    `"${(i.location || "").replace(/"/g, '""')}"`,
    i.amount || "",
    i.trackingNumber || "",
    i.completed ? "Yes" : "No",
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${scan.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_insights.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Scan to JSON
export function exportToJson(scan: ScanItem) {
  const jsonStr = JSON.stringify(scan, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${scan.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Copy Formatted Markdown Text to Clipboard
export function copyMarkdownSummary(scan: ScanItem): string {
  const lines = [
    `# 📸 ${scan.title}`,
    `**Category**: ${scan.category.toUpperCase()} | **AI Confidence**: ${scan.confidence}% | **Timestamp**: ${new Date(scan.timestamp).toLocaleString()}`,
    "",
    "## Extracted Action Insights:",
  ];

  scan.insights.forEach((insight, idx) => {
    lines.push(`### ${idx + 1}. [${insight.type.toUpperCase()}] ${insight.title}`);
    lines.push(`- **Details**: ${insight.subtitle}`);
    if (insight.date) lines.push(`- **Date**: ${insight.date} ${insight.time ? `at ${insight.time}` : ""}`);
    if (insight.location) lines.push(`- **Location**: ${insight.location}`);
    if (insight.amount) lines.push(`- **Amount**: ${insight.amount}`);
    if (insight.trackingNumber) lines.push(`- **Tracking**: ${insight.trackingNumber}`);
    lines.push("");
  });

  const markdownText = lines.join("\n");
  navigator.clipboard.writeText(markdownText);
  return markdownText;
}
