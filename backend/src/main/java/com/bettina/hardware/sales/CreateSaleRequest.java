package com.bettina.hardware.sales;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateSaleRequest {
    private Long customerId;
    private LocalDate saleDate;
    @NotEmpty
    @Valid
    private List<SaleLineRequest> lines;
}
