package com.bettina.hardware.report;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ReportServiceTest {

    @Autowired
    private ReportService reportService;

    @Test
    void dailyReport_returnsSeededData() {
        var report = reportService.dailyReport(LocalDate.now());
        assertThat(report.getSaleCount()).isGreaterThanOrEqualTo(0);
        assertThat(report.getTotalRevenue()).isNotNull();
    }

    @Test
    void inventoryReport_includesProducts() {
        var report = reportService.inventoryReport();
        assertThat(report.getTotalProducts()).isGreaterThan(0);
        assertThat(report.getItems()).isNotEmpty();
    }
}
