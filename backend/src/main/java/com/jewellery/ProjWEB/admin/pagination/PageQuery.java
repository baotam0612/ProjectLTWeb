package com.jewellery.ProjWEB.admin.pagination;

import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Data
public class PageQuery {
    private int page = 0;
    private int size = 10;
    private String q = "";
    private String status;
    private String category;

    public Pageable pageable(String id) {
        if (page < 0 || size < 1 || size > 100) {
            throw new IllegalArgumentException("page phải >= 0; size phải từ 1 đến 100");
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, id));
    }
}
