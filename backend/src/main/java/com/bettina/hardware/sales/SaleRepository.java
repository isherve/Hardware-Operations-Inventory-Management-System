package com.bettina.hardware.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("SELECT s FROM Sale s JOIN FETCH s.employee LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.lineItems li LEFT JOIN FETCH li.product ORDER BY s.saleDate DESC, s.saleId DESC")
    List<Sale> findAllWithDetails();

    @Query("SELECT s FROM Sale s JOIN FETCH s.employee LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.lineItems li LEFT JOIN FETCH li.product WHERE s.saleId = :id")
    Optional<Sale> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate = :date AND s.refunded = false")
    BigDecimal sumTotalByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.saleDate = :date AND s.refunded = false")
    long countByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE YEAR(s.saleDate) = :year AND MONTH(s.saleDate) = :month AND s.refunded = false")
    BigDecimal sumTotalByMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COUNT(s) FROM Sale s WHERE YEAR(s.saleDate) = :year AND MONTH(s.saleDate) = :month AND s.refunded = false")
    long countByMonth(@Param("year") int year, @Param("month") int month);

    List<Sale> findBySaleDateBetweenOrderBySaleDateDesc(LocalDate from, LocalDate to);

    @Query("SELECT DISTINCT s FROM Sale s LEFT JOIN FETCH s.lineItems li LEFT JOIN FETCH li.product WHERE s.saleDate BETWEEN :from AND :to")
    List<Sale> findByDateRangeWithLines(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
