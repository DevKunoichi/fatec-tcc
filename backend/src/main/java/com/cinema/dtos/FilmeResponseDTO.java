package com.cinema.dtos;

import com.cinema.entities.Filme;
import java.time.LocalDateTime;

public record FilmeResponseDTO(
    Long id,
    String titulo,
    String classificacaoEtaria,
    Integer duracaoMinutos,
    String sinopse,
    String genero,
    String posterUrl,
    String diretor,
    String imdbId,
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static FilmeResponseDTO fromEntity(Filme f) {
        return new FilmeResponseDTO(
            f.getId(),
            f.getTitulo(),
            f.getClassificacaoEtaria(),
            f.getDuracaoMinutos(),
            f.getSinopse(),
            f.getGenero(),
            f.getPosterUrl(),
            f.getDiretor(),
            f.getImdbId(),
            f.getDataCadastro(),
            f.getDataAtualizacao()
        );
    }
}