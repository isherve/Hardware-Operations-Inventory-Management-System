package com.bettina.hardware.audit;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Tag(name = "Audit")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public List<AuditLogResponse> recent() {
        return auditService.recent();
    }
}
