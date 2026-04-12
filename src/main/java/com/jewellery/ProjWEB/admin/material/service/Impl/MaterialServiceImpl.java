package com.jewellery.ProjWEB.admin.material.service.Impl;

import com.jewellery.ProjWEB.admin.material.model.MaterialDTO;
import com.jewellery.ProjWEB.admin.material.model.MaterialRequest;
import com.jewellery.ProjWEB.admin.material.repository.MaterialRepository;
import com.jewellery.ProjWEB.admin.material.service.MaterialService;
import com.jewellery.ProjWEB.entity.MaterialEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service

public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final ModelMapper modelMapper;

    public MaterialServiceImpl(MaterialRepository materialRepository, ModelMapper modelMapper){
        this.materialRepository = materialRepository;
        this.modelMapper = modelMapper;
    }

    // implement findall
    @Override
    public List<MaterialDTO> findAll() {
        List<MaterialEntity> materialEntityList = materialRepository.findAll();
        List<MaterialDTO> materialDTOList = new ArrayList<>();
        for(MaterialEntity item : materialEntityList){
            materialDTOList.add(modelMapper.map(item, MaterialDTO.class));
        }
        return materialDTOList;
    }

    @Override
    public MaterialDTO UpdateMaterial(MaterialRequest materialRequest, Integer Id) {
        Optional<MaterialEntity> materialEntity = materialRepository.findById(Id);
        MaterialEntity materialEntity1 = materialRepository.findByMaterialNameEqualsIgnoreCase(materialRequest.getMaterialName());
        modelMapper.map(materialRequest, materialEntity.get());
        if(materialEntity1 == null || materialEntity1.getMaterialID().equals(Id)) {
            materialRepository.save(materialEntity.get());
            return modelMapper.map(materialEntity.get(), MaterialDTO.class);
        } else
            return null;
    }

    @Override
    public MaterialDTO CreateMaterial(MaterialRequest materialRequest) {
        MaterialEntity materialEntity = modelMapper.map(materialRequest, MaterialEntity.class);
        materialRepository.save(materialEntity);
        return modelMapper.map(materialEntity, MaterialDTO.class);
    }

    @Override
    public List<MaterialDTO> findByName(String materialName) {
        List<MaterialEntity> materialEntityList = materialRepository.findListByMaterialName(materialName);
        List<MaterialDTO> materialDTOList = new ArrayList<>();
        for(MaterialEntity item : materialEntityList){
            materialDTOList.add(modelMapper.map(item, MaterialDTO.class));
        }
        return materialDTOList;
    }

    @Override
    public MaterialDTO findOneByName(String materialName) {
        MaterialEntity materialEntity = materialRepository.findByMaterialNameEqualsIgnoreCase(materialName);
        if(materialEntity != null)
            return modelMapper.map(materialEntity, MaterialDTO.class);
        else return null;
    }

    @Override
    public void deleteMaterial(Integer id) {
        MaterialEntity materialEntity = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material Not Found with id: " + id));
        materialRepository.delete(materialEntity);
    }
}
