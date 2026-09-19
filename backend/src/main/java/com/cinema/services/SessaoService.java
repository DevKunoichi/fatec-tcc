package com.cinema.services;

import com.cinema.dtos.SessaoRequestDTO;
import com.cinema.dtos.SessaoResponseDTO;
import com.cinema.entities.Filme;
import com.cinema.entities.Sala;
import com.cinema.entities.Sessao;
import com.cinema.enums.StatusSessao;
import com.cinema.exceptions.RegraNegocioException;
import com.cinema.exceptions.ResourceNotFoundException;
import com.cinema.repositories.FilmeRepository;
import com.cinema.repositories.SalaRepository;
import com.cinema.repositories.SessaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessaoService {

    private final SessaoRepository repository;
    private final FilmeRepository filmeRepository;
    private final SalaRepository salaRepository;

    public SessaoService(SessaoRepository repository,
                         FilmeRepository filmeRepository,
                         SalaRepository salaRepository) {
        this.repository = repository;
        this.filmeRepository = filmeRepository;
        this.salaRepository = salaRepository;
    }

    @Transactional(readOnly = true)
    public List<SessaoResponseDTO> listar() {
        return repository.findAll().stream().map(SessaoResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public SessaoResponseDTO buscarPorId(Long id) {
        return SessaoResponseDTO.fromEntity(requireSessao(id));
    }

    @Transactional
    public SessaoResponseDTO criar(SessaoRequestDTO dto) {
        Filme filme = requireFilme(dto.filmeId());
        Sala sala = requireSala(dto.salaId());
        validarHorario(dto.dataHoraInicio(), dto.dataHoraFim());
        validarConflito(sala.getId(), dto.dataHoraInicio(), dto.dataHoraFim(), -1L);

        Sessao s = new Sessao(
            null,
            filme,
            sala,
            dto.dataHoraInicio(),
            dto.dataHoraFim(),
            StatusSessao.DISPONIVEL
        );
        return SessaoResponseDTO.fromEntity(repository.save(s));
    }

    @Transactional
    public SessaoResponseDTO atualizar(Long id, SessaoRequestDTO dto) {
        Sessao s = requireSessao(id);

        Long filmeId = dto.filmeId() != null ? dto.filmeId() : s.getFilme().getId();
        Long salaId = dto.salaId() != null ? dto.salaId() : s.getSala().getId();
        Filme filme = requireFilme(filmeId);
        Sala sala = requireSala(salaId);
        LocalDateTime inicio = dto.dataHoraInicio() != null ? dto.dataHoraInicio() : s.getDataHoraInicio();
        LocalDateTime fim = dto.dataHoraFim() != null ? dto.dataHoraFim() : s.getDataHoraFim();

        validarHorario(inicio, fim);
        validarConflito(salaId, inicio, fim, id);

        s.setFilme(filme);
        s.setSala(sala);
        s.setDataHoraInicio(inicio);
        s.setDataHoraFim(fim);
        if (dto.status() != null) s.setStatus(dto.status());

        return SessaoResponseDTO.fromEntity(repository.save(s));
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Sessao com ID " + id + " nao encontrada para exclusao.");
        }
        repository.deleteById(id);
    }

    private void validarHorario(LocalDateTime inicio, LocalDateTime fim) {
        if (!fim.isAfter(inicio)) {
            throw new RegraNegocioException("O fim da sessao deve ser posterior ao inicio.");
        }
    }

    private void validarConflito(Long salaId, LocalDateTime inicio, LocalDateTime fim, Long idSelf) {
        boolean conflito = repository.findConflitantes(salaId, StatusSessao.CANCELADA, inicio, fim, idSelf)
                .stream().findAny().isPresent();
        if (conflito) {
            throw new RegraNegocioException("Ja existe uma sessao nessa sala no periodo informado.");
        }
    }

    private Sessao requireSessao(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sessao com ID " + id + " nao encontrada."));
    }

    private Filme requireFilme(Long id) {
        return filmeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filme com ID " + id + " nao encontrado."));
    }

    private Sala requireSala(Long id) {
        return salaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala com ID " + id + " nao encontrada."));
    }
}