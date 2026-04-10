package com.jewellery.ProjWEB.user.product.service.Impl;

import com.jewellery.ProjWEB.entity.ProductEntity;
import com.jewellery.ProjWEB.user.product.model.ProductDTO;
import com.jewellery.ProjWEB.user.product.repository.ProductRepository;
import com.jewellery.ProjWEB.user.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@Service("userProductService")
public class ProductServiceImpl implements ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<ProductDTO> findByCategoryId(Integer CategoryID){
        List<ProductEntity> productEntities= productRepository.findByCategoryId(CategoryID);
        List<ProductDTO> result = new ArrayList<>();
        for(ProductEntity item: productEntities){
            ProductDTO product= new ProductDTO();
            product.setProductName(item.getProductName());
            product.setImageURL(item.getImageUrl());
            result.add(product);
        }
        return result;
    }
}
