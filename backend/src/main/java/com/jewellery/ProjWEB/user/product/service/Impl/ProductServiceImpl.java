package com.jewellery.ProjWEB.user.product.service.Impl;

import com.jewellery.ProjWEB.entity.ProductDetailEntity;
import com.jewellery.ProjWEB.entity.ProductEntity;
import com.jewellery.ProjWEB.user.product.model.ProductDetailDTO;
import com.jewellery.ProjWEB.user.product.model.ProductDTO;
import com.jewellery.ProjWEB.user.product.repository.UserProductRepository;
import com.jewellery.ProjWEB.user.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service("userProductService")
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final UserProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findByCategoryId(Integer CategoryID){
        List<ProductEntity> productEntities = productRepository.findByCategoryId(CategoryID);
        List<ProductDTO> result = new ArrayList<>();
        for(ProductEntity item: productEntities){
            result.add(convertToDTO(item));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findAllPublicProducts() {
        List<ProductEntity> productEntities = productRepository.findAll();
        List<ProductDTO> result = new ArrayList<>();
        for(ProductEntity item: productEntities){
            result.add(convertToDTO(item));
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO findById(Integer id) {
        return productRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    private ProductDTO convertToDTO(ProductEntity item) {
        ProductDTO product = new ProductDTO();
        product.setId(item.getId());
        product.setQuantity(item.getQuantity());
        product.setStatus(item.getStatus());
        product.setProductName(item.getProductName());
        product.setDescription(item.getDescription());
        product.setPrice(item.getPrice());
        product.setImageUrl(item.getImageUrl());
        product.setProductDetails(convertDetails(item.getProductDetails()));
        return product;
    }

    private List<ProductDetailDTO> convertDetails(List<ProductDetailEntity> details) {
        if (details == null || details.isEmpty()) {
            return Collections.emptyList();
        }

        return details.stream().map(this::convertDetailToDTO).collect(Collectors.toList());
    }

    private ProductDetailDTO convertDetailToDTO(ProductDetailEntity detail) {
        ProductDetailDTO dto = new ProductDetailDTO();
        dto.setProductDetailID(detail.getProductDetailID());
        dto.setReferenceWeight(detail.getReferenceWeight());
        dto.setComposition(detail.getComposition());
        dto.setDetailDescription(detail.getDetailDescription());
        dto.setStockQuantity(detail.getProduct().getQuantity());
        if (detail.getMaterial() != null) {
            dto.setMaterialID(detail.getMaterial().getMaterialID());
            dto.setMaterialName(detail.getMaterial().getMaterialName());
        }
        return dto;
    }
}
