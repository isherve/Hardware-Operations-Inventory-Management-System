package com.bettina.hardware.sales;

import com.bettina.hardware.common.enums.TransactionType;
import com.bettina.hardware.common.enums.UserType;
import com.bettina.hardware.common.exception.BusinessException;
import com.bettina.hardware.common.exception.ResourceNotFoundException;
import com.bettina.hardware.config.LoyaltyProperties;
import com.bettina.hardware.config.SecurityUtils;
import com.bettina.hardware.customer.Customer;
import com.bettina.hardware.customer.CustomerRepository;
import com.bettina.hardware.employee.Employee;
import com.bettina.hardware.employee.EmployeeRepository;
import com.bettina.hardware.finance.FinancialRecord;
import com.bettina.hardware.finance.FinancialRecordRepository;
import com.bettina.hardware.inventory.Inventory;
import com.bettina.hardware.inventory.InventoryRepository;
import com.bettina.hardware.product.Product;
import com.bettina.hardware.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final FinancialRecordRepository financialRecordRepository;
    private final SecurityUtils securityUtils;
    private final LoyaltyProperties loyaltyProperties;

    public List<SaleResponse> findAll() {
        return saleRepository.findAllWithDetails().stream().map(this::toResponse).toList();
    }

    public SaleResponse findById(Long id) {
        return toResponse(saleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", id)));
    }

    @Transactional
    public SaleResponse createSale(CreateSaleRequest request) {
        Long employeeId = securityUtils.getCurrentUserId();
        if (securityUtils.getCurrentUser().getUserType() == UserType.ADMIN) {
            throw new BusinessException("Admins cannot record sales. Use an employee account.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
        }

        LocalDate saleDate = request.getSaleDate() != null ? request.getSaleDate() : LocalDate.now();
        Sale sale = Sale.builder()
                .employee(employee)
                .customer(customer)
                .saleDate(saleDate)
                .totalAmount(BigDecimal.ZERO)
                .refunded(false)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        List<SaleProduct> lineItems = new ArrayList<>();

        for (SaleLineRequest line : request.getLines()) {
            Product product = productRepository.findById(line.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", line.getProductId()));

            Inventory inventory = inventoryRepository.findByProductProductId(product.getProductId())
                    .orElseThrow(() -> new BusinessException("No inventory record for product: " + product.getProductName()));

            if (inventory.getQuantityInStock() < line.getQuantity()) {
                throw new BusinessException("Insufficient stock for " + product.getProductName()
                        + ". Available: " + inventory.getQuantityInStock());
            }

            BigDecimal unitPrice = product.getUnitPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(line.getQuantity()));
            total = total.add(lineTotal);

            inventory.setQuantityInStock(inventory.getQuantityInStock() - line.getQuantity());
            inventoryRepository.save(inventory);

            SaleProduct saleProduct = SaleProduct.builder()
                    .id(new SaleProduct.SaleProductId(null, product.getProductId()))
                    .sale(sale)
                    .product(product)
                    .quantity(line.getQuantity())
                    .unitPriceAtSale(unitPrice)
                    .build();
            lineItems.add(saleProduct);
        }

        sale.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
        sale.setLineItems(lineItems);
        sale = saleRepository.save(sale);

        FinancialRecord financialRecord = FinancialRecord.builder()
                .sale(sale)
                .amount(sale.getTotalAmount())
                .transactionDate(saleDate)
                .transactionType(TransactionType.SALE)
                .build();
        financialRecordRepository.save(financialRecord);

        if (customer != null) {
            int points = total.divide(BigDecimal.valueOf(1000), 0, RoundingMode.DOWN)
                    .intValue() * loyaltyProperties.getPointsPer1000Rwf();
            customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
            customerRepository.save(customer);
        }

        return toResponse(saleRepository.findByIdWithDetails(sale.getSaleId()).orElse(sale));
    }

    @Transactional
    public SaleResponse refund(Long saleId) {
        Sale sale = saleRepository.findByIdWithDetails(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", saleId));

        if (sale.isRefunded()) {
            throw new BusinessException("Sale already refunded");
        }

        for (SaleProduct line : sale.getLineItems()) {
            Inventory inventory = inventoryRepository.findByProductProductId(line.getProduct().getProductId())
                    .orElseThrow(() -> new BusinessException("Inventory not found for product"));
            inventory.setQuantityInStock(inventory.getQuantityInStock() + line.getQuantity());
            inventoryRepository.save(inventory);
        }

        sale.setRefunded(true);
        saleRepository.save(sale);

        FinancialRecord refund = FinancialRecord.builder()
                .sale(sale)
                .amount(sale.getTotalAmount().negate())
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.REFUND)
                .build();
        financialRecordRepository.save(refund);

        if (sale.getCustomer() != null) {
            Customer customer = sale.getCustomer();
            int points = sale.getTotalAmount().divide(BigDecimal.valueOf(1000), 0, RoundingMode.DOWN)
                    .intValue() * loyaltyProperties.getPointsPer1000Rwf();
            customer.setLoyaltyPoints(Math.max(0, customer.getLoyaltyPoints() - points));
            customerRepository.save(customer);
        }

        return toResponse(sale);
    }

    private SaleResponse toResponse(Sale sale) {
        List<SaleLineResponse> lines = sale.getLineItems().stream()
                .map(line -> SaleLineResponse.builder()
                        .productId(line.getProduct().getProductId())
                        .productName(line.getProduct().getProductName())
                        .quantity(line.getQuantity())
                        .unitPriceAtSale(line.getUnitPriceAtSale())
                        .lineTotal(line.getUnitPriceAtSale().multiply(BigDecimal.valueOf(line.getQuantity())))
                        .build())
                .toList();

        return SaleResponse.builder()
                .saleId(sale.getSaleId())
                .employeeId(sale.getEmployee().getEmployeeId())
                .employeeName(sale.getEmployee().getEmployeeName())
                .customerId(sale.getCustomer() != null ? sale.getCustomer().getCustomerId() : null)
                .customerName(sale.getCustomer() != null ? sale.getCustomer().getCustomerName() : null)
                .saleDate(sale.getSaleDate())
                .totalAmount(sale.getTotalAmount())
                .refunded(sale.isRefunded())
                .lines(lines)
                .build();
    }
}
