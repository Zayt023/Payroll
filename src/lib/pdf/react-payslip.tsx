import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer"
import type { PayslipData } from "@/types"

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1f2328",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d6d9df",
  },
  brandLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: {
    width: 28,
    height: 28,
    backgroundColor: "#3d766d",
    borderRadius: 6,
  },
  brandName: { fontSize: 13, fontWeight: "bold", color: "#1f2328" },
  brandSub: { fontSize: 7, color: "#8f9192", marginTop: 1 },
  titleArea: { alignItems: "flex-end" },
  title: { fontSize: 16, fontWeight: "bold", color: "#1f2328", letterSpacing: -0.3 },
  titleRef: { fontSize: 7, color: "#8f9192", marginTop: 2 },
  detailCard: {
    backgroundColor: "#f0f3f5",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailCol: { width: "50%", flexDirection: "row" },
  detailLabel: { width: 72, fontSize: 7, color: "#8f9192" },
  detailValue: { fontSize: 8.5, fontWeight: "bold", color: "#1f2328" },
  sectionLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#8f9192",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  tableHeader: {
    backgroundColor: "#3d766d",
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: { color: "#ffffff", fontSize: 8, fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e8eaed",
  },
  tableRowAlt: { backgroundColor: "#f8f9fa" },
  tableRowLast: { borderBottomWidth: 0.5, borderBottomColor: "#d6d9df" },
  tableContainer: { marginBottom: 14 },
  columns: { flexDirection: "row", gap: 12 },
  colHalf: { width: "50%" },
  grossDedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0f3f5",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d6d9df",
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  grossDedItem: { flexDirection: "row", alignItems: "center", gap: 20 },
  grossDedLabel: { fontSize: 8.5, fontWeight: "bold", color: "#1f2328" },
  grossDedValue: { fontSize: 8.5, fontWeight: "bold", color: "#1f2328" },
  netCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3d766d",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  netLabel: { fontSize: 8, color: "#8f9192" },
  netAmount: { fontSize: 22, fontWeight: "bold", color: "#3d766d", marginTop: 1, letterSpacing: -0.3 },
  netDetail: { fontSize: 7, color: "#8f9192", textAlign: "right" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  summaryItem: { width: "33.33%", marginBottom: 5, flexDirection: "row" },
  summaryLabel: { fontSize: 7, color: "#8f9192", marginRight: 4 },
  summaryValue: { fontSize: 7.5, fontWeight: "bold", color: "#1f2328" },
  sigSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e8eaed",
  },
  sigBlock: { width: "28%" },
  sigLabel: { fontSize: 7.5, color: "#8f9192", marginBottom: 3 },
  sigLine: { width: "100%", height: 0.5, backgroundColor: "#d6d9df", marginBottom: 2 },
  sigSub: { fontSize: 6.5, color: "#8f9192" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6,
    color: "#8f9192",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#d6d9df",
  },
})

export function PayslipPDF({ data, company }: { data: PayslipData; company?: { name: string; address: string; tin: string } }) {
  const c = {
    name: company?.name || "A3MB Medical Services",
    address: company?.address || "Unit 7, Future 7 Building, Good Earth, Tondo, Manila, Philippines 1013",
    tin: company?.tin || "000-000-000-000",
  }

  const earnings: [string, number][] = [
    ["Basic Salary", data.basicSalary],
    ["Overtime Pay", data.overtimePay],
    ["Holiday Pay", data.holidayPay],
    ...data.allowances.map((a) => [a.name, a.amount] as [string, number]),
  ]
  const deductions: [string, number][] = [
    ["SSS", data.sssDeduction],
    ["PhilHealth", data.philhealthDeduction],
    ["Pag-IBIG", data.pagibigDeduction],
    ["Withholding Tax", data.taxDeduction],
    ["Cash Advance", data.cashAdvance],
    ...data.deductions.map((d) => [d.name, d.amount] as [string, number]),
  ]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandLeft}>
            <View style={styles.brandIcon} />
            <View>
              <Text style={styles.brandName}>{c.name}</Text>
              <Text style={styles.brandSub}>{c.address}</Text>
            </View>
          </View>
          <View style={styles.titleArea}>
            <Text style={styles.title}>PAYSLIP</Text>
            <Text style={styles.titleRef}>#{data.referenceNumber} | {fmt(data.periodStart)} — {fmt(data.periodEnd)}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Employee</Text>
              <Text style={styles.detailValue}>{data.employee.firstName} {data.employee.lastName}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>ID</Text>
              <Text style={styles.detailValue}>{data.employee.employeeId}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Department</Text>
              <Text style={styles.detailValue}>{data.employee.department}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Position</Text>
              <Text style={styles.detailValue}>{data.employee.position}</Text>
            </View>
          </View>
          <View style={[styles.detailRow, { marginBottom: 0 }]}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Period</Text>
              <Text style={styles.detailValue}>{fmt(data.periodStart)} — {fmt(data.periodEnd)}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>TIN</Text>
              <Text style={styles.detailValue}>{c.tin}</Text>
            </View>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={styles.colHalf}>
            <Text style={styles.sectionLabel}>EARNINGS</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Description</Text>
                <Text style={styles.tableHeaderText}>Amount</Text>
              </View>
              {earnings.map(([label, amt], i) => {
                const rowStyles: any[] = [styles.tableRow]
                if (i % 2 === 1) rowStyles.push(styles.tableRowAlt)
                if (i === earnings.length - 1) rowStyles.push(styles.tableRowLast)
                return (
                  <View key={i} style={rowStyles}>
                    <Text style={{ color: "#1f2328" }}>{label}</Text>
                    <Text style={{ fontWeight: "bold", color: "#1f2328" }}>PHP {amt.toLocaleString()}</Text>
                  </View>
                )
              })}
            </View>
          </View>
          <View style={styles.colHalf}>
            <Text style={styles.sectionLabel}>DEDUCTIONS</Text>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Description</Text>
                <Text style={styles.tableHeaderText}>Amount</Text>
              </View>
              {deductions.map(([label, amt], i) => {
                const rowStyles: any[] = [styles.tableRow]
                if (i % 2 === 1) rowStyles.push(styles.tableRowAlt)
                if (i === deductions.length - 1) rowStyles.push(styles.tableRowLast)
                return (
                  <View key={i} style={rowStyles}>
                    <Text style={{ color: "#1f2328" }}>{label}</Text>
                    <Text style={{ fontWeight: "bold", color: "#1f2328" }}>PHP {amt.toLocaleString()}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        <View style={styles.grossDedRow}>
          <View style={styles.grossDedItem}>
            <Text style={styles.grossDedLabel}>Gross Pay</Text>
            <Text style={styles.grossDedValue}>PHP {data.grossPay.toLocaleString()}</Text>
          </View>
          <View style={styles.grossDedItem}>
            <Text style={styles.grossDedLabel}>Total Deductions</Text>
            <Text style={styles.grossDedValue}>PHP {data.totalDeductions.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.netCard}>
          <View>
            <Text style={styles.netLabel}>NET PAY</Text>
            <Text style={styles.netAmount}>PHP {data.netPay.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.netDetail}>Gross: PHP {data.grossPay.toLocaleString()}</Text>
            <Text style={styles.netDetail}>Deductions: PHP {data.totalDeductions.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SUMMARY</Text>
        <View style={styles.summaryGrid}>
          {[
            ["Regular Hours", `${data.regularHours.toFixed(1)}h`],
            ["Overtime Hours", `${data.overtimeHours.toFixed(1)}h`],
            ["Late Minutes", `${data.lateMinutes.toFixed(0)}min`],
            ["Absences", `${data.absences.toFixed(0)} day(s)`],
            ["Basic Salary", `PHP ${data.basicSalary.toLocaleString()}`],
            ["Daily Rate", `PHP ${data.employee.dailyRate.toLocaleString()}`],
          ].map(([l, v], i) => (
            <View key={i} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{l}</Text>
              <Text style={styles.summaryValue}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sigSection}>
          <View style={styles.sigBlock}>
            <Text style={styles.sigLabel}>Prepared by</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigSub}>HR Department</Text>
          </View>
          <View style={[styles.sigBlock, { alignItems: "center" }]}>
            <Text style={styles.sigLabel}>Received by</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigSub}>Employee Signature</Text>
          </View>
          <View style={[styles.sigBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.sigLabel}>Date</Text>
            <View style={[styles.sigLine, { width: "70%" }]} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Generated: {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })} | Ref: {data.referenceNumber}</Text>
          <Text>This is a computer-generated payslip.</Text>
        </View>
      </Page>
    </Document>
  )
}

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}
