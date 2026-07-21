package com.bettina.hardware.audit;

import com.bettina.hardware.config.SecurityUtils;
import com.bettina.hardware.config.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityUtils securityUtils;

    @Transactional
    public void log(String action, String entityType, Long entityId, String details) {
        String username = null;
        String role = null;
        try {
            UserPrincipal user = securityUtils.getCurrentUser();
            username = user.getUsername();
            role = securityUtils.getRole();
        } catch (Exception ignored) {
            // system / unauthenticated context
        }

        auditLogRepository.save(AuditLog.builder()
                .actorUsername(username)
                .actorRole(role)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build());
    }

    public List<AuditLogResponse> recent() {
        securityUtils.requireAnyRole("ADMIN", "MANAGER");
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(a -> AuditLogResponse.builder()
                        .auditId(a.getAuditId())
                        .actorUsername(a.getActorUsername())
                        .actorRole(a.getActorRole())
                        .action(a.getAction())
                        .entityType(a.getEntityType())
                        .entityId(a.getEntityId())
                        .details(a.getDetails())
                        .createdAt(a.getCreatedAt())
                        .build())
                .toList();
    }
}
