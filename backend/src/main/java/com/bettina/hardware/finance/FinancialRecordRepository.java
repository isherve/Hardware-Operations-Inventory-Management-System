package com.bettina.hardware.finance;

import com.bettina.hardware.common.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {

    List<FinancialRecord> findByTransactionDateBetweenOrderByTransactionDateDescTransactionIdDesc(
            LocalDate from, LocalDate to);

    @Query("SELECT fr FROM FinancialRecord fr LEFT JOIN FETCH fr.sale WHERE fr.transactionDate BETWEEN :from AND :to ORDER BY fr.transactionDate DESC, fr.transactionId DESC")
    List<FinancialRecord> findWithSaleBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    List<FinancialRecord> findByTransactionTypeAndTransactionDateBetween(
            TransactionType type, LocalDate from, LocalDate to);
}
