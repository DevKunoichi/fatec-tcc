package com.cinema.services;

import com.cinema.dtos.SalaRequestDTO;
import com.cinema.dtos.SalaResponseDTO;
import com.cinema.entities.Sala;
import com.cinema.exceptions.RegraNegocioException;
import com.cinema.exceptions.ResourceNotFoundException;
import com.cinema.repositories.SalaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SalaService {

    private final SalaRepository repository;

    public SalaService(SalaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<SalaResponseDTO> listar() {
        return repository.findAll().stream().map(SalaResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public SalaResponseDTO buscarPorId(Long id) {
        return SalaResponseDTO.fromEntity(requireSala(id));
    }

    @Transactional
    public SalaResponseDTO criar(SalaRequestDTO dto) {
        validarNomeDuplicado(dto.nomeNumero());
        Sala s = new Sala();
        s.setNomeNumero(dto.nomeNumero().trim());
        s.setCapacidadeTotal(dto.capacidadeTotal());
        return SalaResponseDTO.fromEntity(repository.save(s));
    }

    @Transactional
    public SalaResponseDTO atualizar(Long id, SalaRequestDTO dto) {
        Sala s = requireSala(id);
        if (!s.getNomeNumero().equalsIgnoreCase(dto.nomeNumero().trim())) {
            validarNomeDuplicado(dto.nomeNumero());
        }
        s.setNomeNumero(dto.nomeNumero().trim());
        s.setCapacidadeTotal(dto.capacidadeTotal());
        return SalaResponseDTO.fromEntity(repository.save(s));
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Sala com ID " + id + " nao encontrada para exclusao.");
        }
        repository.deleteById(id);
    }

    private Sala requireSala(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala com ID " + id + " nao encontrada."));
    }

    private void validarNomeDuplicado(String nomeNumero) {
        boolean existe = repository.findByNomeNumeroIgnoreCase(nomeNumero.trim()).isPresent();
        if (existe) {
            throw new RegraNegocioException("Ja existe uma sala com o nome/numero '" + nomeNumero.trim() + "'.");
        }
    }
}