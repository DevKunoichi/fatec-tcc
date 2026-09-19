package com.cinema.services;

import com.cinema.dtos.FilmeRequestDTO;
import com.cinema.dtos.FilmeResponseDTO;
import com.cinema.dtos.OmdbMovieResponse;
import com.cinema.entities.Filme;
import com.cinema.exceptions.ResourceNotFoundException;
import com.cinema.repositories.FilmeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FilmeService {

    private final FilmeRepository repository;
    private final OmdbService omdbService;

    public FilmeService(FilmeRepository repository, OmdbService omdbService) {
        this.repository = repository;
        this.omdbService = omdbService;
    }

    @Transactional(readOnly = true)
    public List<FilmeResponseDTO> listar(String termo) {
        List<Filme> list = (termo != null && !termo.isBlank())
                ? repository.findByTituloContainingIgnoreCase(termo.trim())
                : repository.findAllByOrderByTituloAsc();
        return list.stream().map(FilmeResponseDTO::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public FilmeResponseDTO buscarPorId(Long id) {
        return FilmeResponseDTO.fromEntity(requireFilme(id));
    }

    @Transactional
    public FilmeResponseDTO criar(FilmeRequestDTO dto) {
        Filme f = new Filme();
        aplicarDados(f, dto);
        return FilmeResponseDTO.fromEntity(repository.save(f));
    }

    @Transactional
    public FilmeResponseDTO atualizar(Long id, FilmeRequestDTO dto) {
        Filme f = requireFilme(id);
        aplicarDados(f, dto);
        return FilmeResponseDTO.fromEntity(repository.save(f));
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Filme com ID " + id + " nao encontrado para exclusao.");
        }
        repository.deleteById(id);
    }

    /**
     * Busca o filme na OMDb e cadastra (ou reutiliza) no catalogo local.
     * Deduplicacao por imdbId, e por titulo como fallback quando nao ha imdbId.
     */
    @Transactional
    public FilmeResponseDTO buscarEOuCadastrar(String titulo) {
        OmdbMovieResponse dados = omdbService.buscarPorTitulo(titulo);

        if (dados.imdbId() != null) {
            Optional<Filme> existente = repository.findByImdbId(dados.imdbId());
            if (existente.isPresent()) {
                return FilmeResponseDTO.fromEntity(existente.get());
            }
        }

        if (dados.title() != null) {
            Optional<Filme> porTitulo = repository.findByTituloContainingIgnoreCase(dados.title().trim())
                    .stream().findFirst();
            if (porTitulo.isPresent()) {
                return FilmeResponseDTO.fromEntity(porTitulo.get());
            }
        }

        Filme f = new Filme();
        f.setTitulo(limpar(dados.title(), "Filme sem titulo"));
        f.setClassificacaoEtaria(limpar(dados.rated(), null));
        f.setDuracaoMinutos(parseMinutos(dados.runtime()));
        f.setSinopse(limpar(dados.plot(), null));
        f.setGenero(limpar(dados.genre(), null));
        f.setPosterUrl(limpar(dados.poster(), null));
        f.setDiretor(limpar(dados.director(), null));
        f.setImdbId(limpar(dados.imdbId(), null));

        return FilmeResponseDTO.fromEntity(repository.save(f));
    }

    private void aplicarDados(Filme f, FilmeRequestDTO dto) {
        f.setTitulo(dto.titulo().trim());
        f.setClassificacaoEtaria(dto.classificacaoEtaria());
        f.setDuracaoMinutos(dto.duracaoMinutos());
        f.setSinopse(dto.sinopse());
        f.setGenero(dto.genero());
        f.setPosterUrl(dto.posterUrl());
        f.setDiretor(dto.diretor());
        f.setImdbId(dto.imdbId());
    }

    private Filme requireFilme(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filme com ID " + id + " nao encontrado."));
    }

    /** OMDb usa "N/A" para campos ausentes; converte para null (ou o padrao informado). */
    private String limpar(String valor, String padrao) {
        if (valor == null || valor.isBlank() || "N/A".equalsIgnoreCase(valor)) {
            return padrao;
        }
        return valor.trim();
    }

    /** "166 min" -> 166. Retorna null quando nao for possivel converter. */
    private Integer parseMinutos(String runtime) {
        String limpo = limpar(runtime, null);
        if (limpo == null) return null;
        try {
            return Integer.parseInt(limpo.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}