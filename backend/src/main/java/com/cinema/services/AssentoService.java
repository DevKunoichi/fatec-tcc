package com.cinema.services;

import com.cinema.dtos.AssentoRequestDTO;
import com.cinema.dtos.AssentoResponseDTO;
import com.cinema.entities.Assento;
import com.cinema.entities.Sala;
import com.cinema.enums.StatusAssento;
import com.cinema.exceptions.RegraNegocioException;
import com.cinema.exceptions.ResourceNotFoundException;
import com.cinema.repositories.AssentoRepository;
import com.cinema.repositories.IngressoRepository;
import com.cinema.repositories.SalaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class AssentoService {

    private static final int ASSENTOS_POR_FILEIRA = 20;

    private final AssentoRepository repository;
    private final SalaRepository salaRepository;
    private final IngressoRepository ingressoRepository;

    public AssentoService(AssentoRepository repository,
                          SalaRepository salaRepository,
                          IngressoRepository ingressoRepository) {
        this.repository = repository;
        this.salaRepository = salaRepository;
        this.ingressoRepository = ingressoRepository;
    }

    @Transactional(readOnly = true)
    public List<AssentoResponseDTO> listar(Long salaId) {
        if (salaId != null) {
            return repository.findBySalaIdOrderByFileiraAscNumeroAsc(salaId)
                    .stream().map(AssentoResponseDTO::fromEntity).toList();
        }
        return repository.findAll().stream().map(AssentoResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public AssentoResponseDTO buscarPorId(Long id) {
        return AssentoResponseDTO.fromEntity(requireAssento(id));
    }

    @Transactional
    public AssentoResponseDTO criar(AssentoRequestDTO dto) {
        Sala sala = requireSala(dto.salaId());
        validarAssento(dto, sala.getId());

        Assento a = new Assento(
            null,
            sala,
            dto.fileira().trim().toUpperCase(),
            dto.numero(),
            dto.status() != null ? dto.status() : StatusAssento.DISPONIVEL
        );
        return AssentoResponseDTO.fromEntity(repository.save(a));
    }

    @Transactional
    public AssentoResponseDTO atualizar(Long id, AssentoRequestDTO dto) {
        Assento a = requireAssento(id);
        Long salaId = dto.salaId() != null ? dto.salaId() : a.getSala().getId();
        Sala sala = requireSala(salaId);

        String fileira = dto.fileira() != null ? dto.fileira().trim().toUpperCase() : a.getFileira();
        Integer numero = dto.numero() != null ? dto.numero() : a.getNumero();

        if (!(a.getSala().getId().equals(salaId) && a.getFileira().equals(fileira) && a.getNumero().equals(numero))) {
            validarAssento(new AssentoRequestDTO(salaId, fileira, numero, dto.status()), salaId);
        }

        a.setSala(sala);
        a.setFileira(fileira);
        a.setNumero(numero);
        if (dto.status() != null) a.setStatus(dto.status());
        return AssentoResponseDTO.fromEntity(repository.save(a));
    }

    @Transactional
    public void excluir(Long id) {
        Assento a = requireAssento(id);
        if (ingressoRepository.existsByAssentoId(id)) {
            throw new RegraNegocioException("Nao e possivel excluir um assento que ja possui ingresso vendido/reservado.");
        }
        repository.delete(a);
    }

    @Transactional
    public void gerarAssentosParaSala(Sala sala) {
        if (repository.countBySalaId(sala.getId()) == 0) {
            repository.saveAll(gerarAssentos(sala));
        }
    }

    @Transactional(readOnly = true)
    public List<Assento> listarEntityPorSala(Long salaId) {
        return repository.findBySalaIdOrderByFileiraAscNumeroAsc(salaId);
    }

    /**
     * Gera o grid de assentos da sala (fileiras a partir de A, ate 20 assentos por fileira),
     * respeitando a capacidade total informada.
     */
    public static List<Assento> gerarAssentos(Sala sala) {
        int capacidade = sala.getCapacidadeTotal() != null ? sala.getCapacidadeTotal() : 0;
        List<Assento> assentos = new ArrayList<>();
        if (capacidade <= 0) return assentos;

        int fileiras = Math.max(1, (capacidade + ASSENTOS_POR_FILEIRA - 1) / ASSENTOS_POR_FILEIRA);
        int restante = capacidade;
        for (int r = 0; r < fileiras && restante > 0; r++) {
            String fileira = String.valueOf((char) ('A' + r));
            int n = Math.min(ASSENTOS_POR_FILEIRA, restante);
            for (int i = 1; i <= n; i++) {
                assentos.add(new Assento(null, sala, fileira, i, StatusAssento.DISPONIVEL));
            }
            restante -= n;
        }
        return assentos;
    }

    private void validarAssento(AssentoRequestDTO dto, Long salaId) {
        if (dto.fileira() == null || dto.fileira().trim().isEmpty()) {
            throw new RegraNegocioException("A fileira do assento e obrigatoria.");
        }
        if (dto.fileira().trim().length() > 5) {
            throw new RegraNegocioException("A fileira deve ter no maximo 5 caracteres.");
        }
        if (dto.numero() == null || dto.numero() <= 0) {
            throw new RegraNegocioException("O numero do assento deve ser um inteiro positivo.");
        }
        boolean duplicado = repository.existsBySalaIdAndFileiraAndNumero(salaId, dto.fileira().trim().toUpperCase(), dto.numero());
        if (duplicado) {
            throw new RegraNegocioException("Ja existe um assento com esse numero na fileira dessa sala.");
        }
    }

    private Sala requireSala(Long id) {
        return salaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala com ID " + id + " nao encontrada."));
    }

    private Assento requireAssento(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assento com ID " + id + " nao encontrado."));
    }
}