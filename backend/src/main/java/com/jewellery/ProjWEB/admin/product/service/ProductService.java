package com.jewellery.ProjWEB.admin.product.service;

import com.jewellery.ProjWEB.admin.product.model.dto.ProductDTO;
import com.jewellery.ProjWEB.admin.product.model.request.ProductRequest;
import com.jewellery.ProjWEB.admin.product.model.response.ProductResponse;

import java.util.List;

public interface ProductService {
    List<ProductDTO> findAll(ProductRequest productRequest);

    ProductDTO addProduct(ProductRequest productRequest);

    ProductDTO updateProduct(Integer id, ProductRequest productRequest);

    void deleteProduct(Integer id);
}
