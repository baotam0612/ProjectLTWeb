package com.jewellery.ProjWEB.admin.product.controller;

import com.jewellery.ProjWEB.admin.pagination.AdminListService;
import com.jewellery.ProjWEB.admin.pagination.PageQuery;
import com.jewellery.ProjWEB.admin.pagination.PageResponse;
import com.jewellery.ProjWEB.admin.product.model.dto.ProductDTO;
import com.jewellery.ProjWEB.admin.product.model.request.ProductRequest;
import com.jewellery.ProjWEB.admin.product.model.response.ProductResponse;
import com.jewellery.ProjWEB.admin.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.http.HttpRequest;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class ProductController {
    private final AdminListService lists;

    private final ProductService productService;

    public ProductController(ProductService productService, AdminListService lists) {
        this.lists = lists;
        this.productService = productService;
    }

    // Tìm kiếm
    @GetMapping(value = "/products", params = "page")
    public PageResponse<ProductDTO> pagedList(@ModelAttribute PageQuery query) {
        return lists.products(query);
    }

    @GetMapping(value = "/products", params = "!page")
    public ProductResponse adminPage(ProductRequest productRequest) {
        List<ProductDTO> li = productService.findAll(productRequest);
        return new ProductResponse(HttpStatus.OK, "Query Successfully", li);
    }

    // thêm sản phẩm
    @PostMapping("/products")
    public ProductResponse createProduct(@Valid @RequestBody ProductRequest productRequest) {

        ProductDTO result = productService.addProduct(productRequest);
        return new ProductResponse(HttpStatus.CREATED, "Add succesfully", result);
    }

    // sửa sản phẩm
    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(@PathVariable Integer id, @Valid @RequestBody ProductRequest productRequest) {
        ProductDTO res = productService.updateProduct(id, productRequest);
        return new ProductResponse(HttpStatus.OK, "Updated product", res);
    }

    // xóa product
    @DeleteMapping("/products/{id}")
    public ProductResponse deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return new ProductResponse(HttpStatus.OK, "Deleted product successfully", null);
    }
}
