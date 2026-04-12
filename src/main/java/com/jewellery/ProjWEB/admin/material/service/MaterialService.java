package com.jewellery.ProjWEB.admin.material.service;


import com.jewellery.ProjWEB.admin.material.model.MaterialDTO;
import com.jewellery.ProjWEB.admin.material.model.MaterialRequest;
import com.jewellery.ProjWEB.entity.MaterialEntity;
import org.springframework.stereotype.Service;

import java.util.List;


public interface MaterialService {
    List<MaterialDTO> findAll();

    List<MaterialDTO> findByName(String materialName);

    MaterialDTO findOneByName(String materialName);

    MaterialDTO CreateMaterial(MaterialRequest materialRequest);

    MaterialDTO UpdateMaterial(MaterialRequest materialRequest, Integer Id);

    void deleteMaterial(Integer id);
}
