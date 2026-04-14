package com.jewellery.ProjWEB.user.product.service;

import com.jewellery.ProjWEB.user.product.model.ProductDTO;
import com.jewellery.ProjWEB.user.product.model.ProductSearchRequest;

import java.util.List;

public interface ProductService {
//    List<ProductDTO> findByCategoryId(Integer CategoryID);
//    List<ProductDTO> findByProductNameContaining(String name, String type);
    List<ProductDTO> searchandfindProduct(ProductSearchRequest request);
}
