package com.jewellery.ProjWEB.admin.product.service.Impl;

import com.jewellery.ProjWEB.admin.product.Specification.ProductSpecification;
import com.jewellery.ProjWEB.admin.product.model.dto.ProductDTO;
import com.jewellery.ProjWEB.admin.product.model.request.ProductRequest;
import com.jewellery.ProjWEB.admin.category.repository.CategoryRepository;
import com.jewellery.ProjWEB.admin.product.repository.ProductRepository;
import com.jewellery.ProjWEB.admin.product.service.ProductService;
import com.jewellery.ProjWEB.entity.CategoryEntity;
import com.jewellery.ProjWEB.entity.ProductEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final CategoryRepository categoryRepository;

    public ProductServiceImpl(ProductRepository productRepository, ModelMapper modelMapper, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.modelMapper = modelMapper;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<ProductDTO> findAll(ProductRequest productRequest){
        List<ProductEntity> li = productRepository.findAll(ProductSpecification.search(productRequest));
        if(li.isEmpty()) throw new RuntimeException("Product Not Found!");
        List<ProductDTO> res = new ArrayList<>();
        for(ProductEntity it : li){
            ProductDTO pd = modelMapper.map(it,ProductDTO.class);
            pd.setCategoryName(it.getCategory().getCategoryName());
            res.add(pd);
        }
        return res;
    }

    @Override
    public ProductDTO addProduct(ProductRequest productRequest){
        ProductEntity res = modelMapper.map(productRequest, ProductEntity.class);
        CategoryEntity category = categoryRepository.findByCategoryName(productRequest.getCategoryName());
        if(category == null) throw new RuntimeException("Category not be found");
        res.setCategory(category);
        productRepository.save(res);
        ProductDTO productDTO = modelMapper.map(res,ProductDTO.class);

        return productDTO;
    }

    @Override
    public ProductDTO updateProduct(Integer id, ProductRequest productRequest) {
        ProductEntity productEntity = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found!"));
        CategoryEntity category = categoryRepository.findByCategoryName(productRequest.getCategoryName());
        if(category == null) throw new RuntimeException("Category not be found");
        modelMapper.map(productRequest,productEntity);
        productEntity.setCategory(category);
        productEntity = productRepository.save(productEntity);
        return modelMapper.map(productEntity, ProductDTO.class);
    }

//    @Override
//    public ProductDTO deleteProduct(Integer id) {
//        ProductEntity productEntity = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product Not Found!"));
//        if(productEntity.getStatus())
//    }


}
