package com.bettina.hardware.sales;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@Tag(name = "Sales")
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public List<SaleResponse> list() {
        return saleService.findAll();
    }

    @GetMapping("/{id}")
    public SaleResponse get(@PathVariable Long id) {
        return saleService.findById(id);
    }

    @PostMapping
    public ResponseEntity<SaleResponse> create(@Valid @RequestBody CreateSaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
    }

    @PostMapping("/{id}/refund")
    public SaleResponse refund(@PathVariable Long id) {
        return saleService.refund(id);
    }
}
