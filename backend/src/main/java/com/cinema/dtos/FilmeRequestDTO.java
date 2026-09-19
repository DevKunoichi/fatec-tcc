package com.cinema.dtos;

import jakarta.validation.constraints.NotBlank;

public record FilmeRequestDTO(
    @NotBlank(message = "O titulo do filme e obrigatorio")
    String titulo,

    String classificacaoEtaria,
    Integer duracaoMinutos,
    String sinopse,
    String genero,
    String posterUrl,
    String diretor,
    String imdbId
) {}