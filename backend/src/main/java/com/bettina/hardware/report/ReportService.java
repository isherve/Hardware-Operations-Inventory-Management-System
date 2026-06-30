package com.bettina.hardware.report;

import com.bettina.hardware.common.enums.TransactionType;
import com.bettina.hardware.finance.FinancialRecord;
import com.bettina.hardware.finance.FinancialRecordRepository;
import com.bettina.hardware.inventory.Inventory;
import com.bettina.hardware.inventory.InventoryRepository;
import com.bettina.hardware.sales.Sale;
import com.bettina.hardware.sales.SaleProduct;
import com.bettina.hardware.sales.SaleRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

import static com.bettina.hardware.report.ReportDtos.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;
    private final InventoryRepository inventoryRepository;
    private final FinancialRecordRepository financialRecordRepository;

    public DailyReport dailyReport(LocalDate date) {
        List<Sale> sales = saleRepository.findBySaleDateBetweenOrderBySaleDateDesc(date, date);
        BigDecimal total = saleRepository.sumTotalByDate(date);
        return DailyReport.builder()
                .date(date)
                .saleCount(saleRepository.countByDate(date))
                .totalRevenue(total)
                .sales(sales.stream().map(this::toSaleSummary).toList())
                .build();
    }

    public MonthlyReport monthlyReport(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = YearMonth.of(year, month).atEndOfMonth();
        List<Sale> sales = saleRepository.findBySaleDateBetweenOrderBySaleDateDesc(start, end);
        return MonthlyReport.builder()
                .year(year)
                .month(month)
                .saleCount(saleRepository.countByMonth(year, month))
                .totalRevenue(saleRepository.sumTotalByMonth(year, month))
                .sales(sales.stream().map(this::toSaleSummary).toList())
                .build();
    }

    public InventoryReport inventoryReport() {
        List<Inventory> all = inventoryRepository.findAllWithProduct();
        List<InventoryItem> items = all.stream().map(this::toInventoryItem).toList();
        List<InventoryItem> lowStock = items.stream().filter(InventoryItem::isLowStock).toList();
        BigDecimal valuation = items.stream()
                .map(InventoryItem::getValuation)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return InventoryReport.builder()
                .totalProducts(items.size())
                .lowStockCount(lowStock.size())
                .totalValuation(valuation)
                .items(items)
                .lowStockItems(lowStock)
                .build();
    }

    public TransactionReport transactionReport(LocalDate from, LocalDate to) {
        List<FinancialRecord> records = financialRecordRepository.findWithSaleBetween(from, to);
        BigDecimal sales = records.stream()
                .filter(r -> r.getTransactionType() == TransactionType.SALE)
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal refunds = records.stream()
                .filter(r -> r.getTransactionType() == TransactionType.REFUND)
                .map(FinancialRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return TransactionReport.builder()
                .from(from)
                .to(to)
                .transactionCount(records.size())
                .totalSales(sales)
                .totalRefunds(refunds)
                .netTotal(sales.add(refunds))
                .transactions(records.stream().map(this::toTransactionItem).toList())
                .build();
    }

    public DashboardReport dashboard() {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.withDayOfMonth(1);
        List<Sale> monthSales = saleRepository.findByDateRangeWithLines(monthStart, today);
        List<TopProduct> topProducts = computeTopProducts(monthSales, 5);
        return DashboardReport.builder()
                .salesToday(saleRepository.sumTotalByDate(today))
                .salesCountToday(saleRepository.countByDate(today))
                .salesThisMonth(saleRepository.sumTotalByMonth(today.getYear(), today.getMonthValue()))
                .salesCountThisMonth(saleRepository.countByMonth(today.getYear(), today.getMonthValue()))
                .lowStockCount(inventoryRepository.findLowStock().size())
                .revenueToday(saleRepository.sumTotalByDate(today))
                .topProducts(topProducts)
                .build();
    }

    public byte[] exportCsv(String reportType, LocalDate date, Integer month, Integer year, LocalDate from, LocalDate to) {
        StringWriter writer = new StringWriter();
        try (CSVWriter csv = new CSVWriter(writer)) {
            switch (reportType) {
                case "daily" -> writeDailyCsv(csv, dailyReport(date != null ? date : LocalDate.now()));
                case "monthly" -> writeMonthlyCsv(csv, monthlyReport(
                        year != null ? year : LocalDate.now().getYear(),
                        month != null ? month : LocalDate.now().getMonthValue()));
                case "inventory" -> writeInventoryCsv(csv, inventoryReport());
                case "transactions" -> writeTransactionsCsv(csv, transactionReport(
                        from != null ? from : LocalDate.now().minusDays(30),
                        to != null ? to : LocalDate.now()));
                default -> throw new IllegalArgumentException("Unknown report type: " + reportType);
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV export failed", e);
        }
        return writer.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportPdf(String reportType, LocalDate date, Integer month, Integer year, LocalDate from, LocalDate to) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            switch (reportType) {
                case "daily" -> writeDailyPdf(document, titleFont, headerFont, bodyFont,
                        dailyReport(date != null ? date : LocalDate.now()));
                case "monthly" -> writeMonthlyPdf(document, titleFont, headerFont, bodyFont,
                        monthlyReport(year != null ? year : LocalDate.now().getYear(),
                                month != null ? month : LocalDate.now().getMonthValue()));
                case "inventory" -> writeInventoryPdf(document, titleFont, headerFont, bodyFont, inventoryReport());
                case "transactions" -> writeTransactionsPdf(document, titleFont, headerFont, bodyFont,
                        transactionReport(from != null ? from : LocalDate.now().minusDays(30),
                                to != null ? to : LocalDate.now()));
                default -> throw new IllegalArgumentException("Unknown report type: " + reportType);
            }
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF export failed", e);
        }
    }

    private List<TopProduct> computeTopProducts(List<Sale> sales, int limit) {
        Map<Long, TopProductAccumulator> map = new HashMap<>();
        for (Sale sale : sales) {
            if (sale.isRefunded()) continue;
            for (SaleProduct line : sale.getLineItems()) {
                Long pid = line.getProduct().getProductId();
                map.computeIfAbsent(pid, k -> new TopProductAccumulator(
                        pid, line.getProduct().getProductName()))
                        .add(line.getQuantity(), line.getUnitPriceAtSale());
            }
        }
        return map.values().stream()
                .sorted(Comparator.comparingLong(TopProductAccumulator::quantitySold).reversed())
                .limit(limit)
                .map(a -> TopProduct.builder()
                        .productId(a.productId)
                        .productName(a.productName)
                        .quantitySold(a.quantitySold)
                        .revenue(a.revenue)
                        .build())
                .collect(Collectors.toList());
    }

    private SaleSummary toSaleSummary(Sale sale) {
        return SaleSummary.builder()
                .saleId(sale.getSaleId())
                .saleDate(sale.getSaleDate())
                .employeeName(sale.getEmployee().getEmployeeName())
                .customerName(sale.getCustomer() != null ? sale.getCustomer().getCustomerName() : "Walk-in")
                .totalAmount(sale.getTotalAmount())
                .refunded(sale.isRefunded())
                .build();
    }

    private InventoryItem toInventoryItem(Inventory inv) {
        BigDecimal valuation = inv.getProduct().getUnitPrice()
                .multiply(BigDecimal.valueOf(inv.getQuantityInStock()));
        return InventoryItem.builder()
                .productId(inv.getProduct().getProductId())
                .productName(inv.getProduct().getProductName())
                .category(inv.getProduct().getCategory())
                .quantityInStock(inv.getQuantityInStock())
                .reorderLevel(inv.getReorderLevel())
                .unitPrice(inv.getProduct().getUnitPrice())
                .valuation(valuation)
                .lowStock(inv.isLowStock())
                .build();
    }

    private TransactionItem toTransactionItem(FinancialRecord r) {
        return TransactionItem.builder()
                .transactionId(r.getTransactionId())
                .transactionDate(r.getTransactionDate())
                .transactionType(r.getTransactionType().name())
                .saleId(r.getSale() != null ? r.getSale().getSaleId() : null)
                .amount(r.getAmount())
                .build();
    }

    private void writeDailyCsv(CSVWriter csv, DailyReport report) {
        csv.writeNext(new String[]{"Daily Sales Report", report.getDate().toString()});
        csv.writeNext(new String[]{"Sale Count", String.valueOf(report.getSaleCount())});
        csv.writeNext(new String[]{"Total Revenue (RWF)", report.getTotalRevenue().toPlainString()});
        csv.writeNext(new String[]{});
        csv.writeNext(new String[]{"Sale ID", "Date", "Employee", "Customer", "Amount", "Refunded"});
        report.getSales().forEach(s -> csv.writeNext(new String[]{
                String.valueOf(s.getSaleId()), s.getSaleDate().toString(), s.getEmployeeName(),
                s.getCustomerName(), s.getTotalAmount().toPlainString(), String.valueOf(s.isRefunded())
        }));
    }

    private void writeMonthlyCsv(CSVWriter csv, MonthlyReport report) {
        csv.writeNext(new String[]{"Monthly Sales Report", report.getYear() + "-" + report.getMonth()});
        csv.writeNext(new String[]{"Sale Count", String.valueOf(report.getSaleCount())});
        csv.writeNext(new String[]{"Total Revenue (RWF)", report.getTotalRevenue().toPlainString()});
        csv.writeNext(new String[]{});
        csv.writeNext(new String[]{"Sale ID", "Date", "Employee", "Customer", "Amount", "Refunded"});
        report.getSales().forEach(s -> csv.writeNext(new String[]{
                String.valueOf(s.getSaleId()), s.getSaleDate().toString(), s.getEmployeeName(),
                s.getCustomerName(), s.getTotalAmount().toPlainString(), String.valueOf(s.isRefunded())
        }));
    }

    private void writeInventoryCsv(CSVWriter csv, InventoryReport report) {
        csv.writeNext(new String[]{"Inventory Report"});
        csv.writeNext(new String[]{"Total Products", String.valueOf(report.getTotalProducts())});
        csv.writeNext(new String[]{"Low Stock Count", String.valueOf(report.getLowStockCount())});
        csv.writeNext(new String[]{"Total Valuation (RWF)", report.getTotalValuation().toPlainString()});
        csv.writeNext(new String[]{});
        csv.writeNext(new String[]{"Product", "Category", "Qty", "Reorder", "Unit Price", "Valuation", "Low Stock"});
        report.getItems().forEach(i -> csv.writeNext(new String[]{
                i.getProductName(), i.getCategory(), String.valueOf(i.getQuantityInStock()),
                String.valueOf(i.getReorderLevel()), i.getUnitPrice().toPlainString(),
                i.getValuation().toPlainString(), String.valueOf(i.isLowStock())
        }));
    }

    private void writeTransactionsCsv(CSVWriter csv, TransactionReport report) {
        csv.writeNext(new String[]{"Transaction Report", report.getFrom() + " to " + report.getTo()});
        csv.writeNext(new String[]{"Net Total (RWF)", report.getNetTotal().toPlainString()});
        csv.writeNext(new String[]{});
        csv.writeNext(new String[]{"ID", "Date", "Type", "Sale ID", "Amount"});
        report.getTransactions().forEach(t -> csv.writeNext(new String[]{
                String.valueOf(t.getTransactionId()), t.getTransactionDate().toString(),
                t.getTransactionType(), t.getSaleId() != null ? String.valueOf(t.getSaleId()) : "",
                t.getAmount().toPlainString()
        }));
    }

    private void writeDailyPdf(Document doc, Font title, Font header, Font body, DailyReport report) throws DocumentException {
        doc.add(new Paragraph("Bettina Hardware - Daily Sales Report", title));
        doc.add(new Paragraph("Date: " + report.getDate(), body));
        doc.add(new Paragraph("Sales: " + report.getSaleCount() + " | Revenue: RWF " + report.getTotalRevenue().toPlainString(), body));
        doc.add(Chunk.NEWLINE);
        PdfPTable table = new PdfPTable(5);
        addHeader(table, header, "ID", "Employee", "Customer", "Amount", "Refunded");
        report.getSales().forEach(s -> addRow(table, body,
                String.valueOf(s.getSaleId()), s.getEmployeeName(), s.getCustomerName(),
                s.getTotalAmount().toPlainString(), String.valueOf(s.isRefunded())));
        doc.add(table);
    }

    private void writeMonthlyPdf(Document doc, Font title, Font header, Font body, MonthlyReport report) throws DocumentException {
        doc.add(new Paragraph("Bettina Hardware - Monthly Sales Report", title));
        doc.add(new Paragraph("Period: " + report.getYear() + "-" + report.getMonth(), body));
        doc.add(new Paragraph("Sales: " + report.getSaleCount() + " | Revenue: RWF " + report.getTotalRevenue().toPlainString(), body));
        doc.add(Chunk.NEWLINE);
        PdfPTable table = new PdfPTable(5);
        addHeader(table, header, "ID", "Date", "Employee", "Customer", "Amount");
        report.getSales().forEach(s -> addRow(table, body,
                String.valueOf(s.getSaleId()), s.getSaleDate().toString(), s.getEmployeeName(),
                s.getCustomerName(), s.getTotalAmount().toPlainString()));
        doc.add(table);
    }

    private void writeInventoryPdf(Document doc, Font title, Font header, Font body, InventoryReport report) throws DocumentException {
        doc.add(new Paragraph("Bettina Hardware - Inventory Report", title));
        doc.add(new Paragraph("Products: " + report.getTotalProducts() + " | Low stock: " + report.getLowStockCount()
                + " | Valuation: RWF " + report.getTotalValuation().toPlainString(), body));
        doc.add(Chunk.NEWLINE);
        PdfPTable table = new PdfPTable(5);
        addHeader(table, header, "Product", "Category", "Qty", "Reorder", "Valuation");
        report.getItems().forEach(i -> addRow(table, body,
                i.getProductName(), i.getCategory(), String.valueOf(i.getQuantityInStock()),
                String.valueOf(i.getReorderLevel()), i.getValuation().toPlainString()));
        doc.add(table);
    }

    private void writeTransactionsPdf(Document doc, Font title, Font header, Font body, TransactionReport report) throws DocumentException {
        doc.add(new Paragraph("Bettina Hardware - Transaction Report", title));
        doc.add(new Paragraph(report.getFrom() + " to " + report.getTo() + " | Net: RWF " + report.getNetTotal().toPlainString(), body));
        doc.add(Chunk.NEWLINE);
        PdfPTable table = new PdfPTable(4);
        addHeader(table, header, "ID", "Date", "Type", "Amount");
        report.getTransactions().forEach(t -> addRow(table, body,
                String.valueOf(t.getTransactionId()), t.getTransactionDate().toString(),
                t.getTransactionType(), t.getAmount().toPlainString()));
        doc.add(table);
    }

    private void addHeader(PdfPTable table, Font font, String... cols) {
        for (String col : cols) {
            PdfPCell cell = new PdfPCell(new Phrase(col, font));
            cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
            table.addCell(cell);
        }
    }

    private void addRow(PdfPTable table, Font font, String... cols) {
        for (String col : cols) {
            table.addCell(new Phrase(col, font));
        }
    }

    private static class TopProductAccumulator {
        final Long productId;
        final String productName;
        long quantitySold;
        BigDecimal revenue = BigDecimal.ZERO;

        TopProductAccumulator(Long productId, String productName) {
            this.productId = productId;
            this.productName = productName;
        }

        void add(int qty, BigDecimal unitPrice) {
            quantitySold += qty;
            revenue = revenue.add(unitPrice.multiply(BigDecimal.valueOf(qty)));
        }

        long quantitySold() {
            return quantitySold;
        }
    }
}
