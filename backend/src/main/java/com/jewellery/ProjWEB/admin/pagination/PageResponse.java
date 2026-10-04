package com.jewellery.ProjWEB.admin.pagination;

import org.springframework.data.domain.Page;
import java.util.List;
import java.util.Map;

public record PageResponse<T>(List<T> content, int number, int size,
        long totalElements, int totalPages, Map<String, Object> summary) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), Map.of());
    }

    public PageResponse<T> withSummary(Map<String, Object> summary) {
        return new PageResponse<>(content, number, size, totalElements, totalPages, summary);
    }
}
