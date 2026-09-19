package com.cinema.dtos;

import com.cinema.enums.StatusSessao;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record SessaoRequestDTO(
    @NotNull(message = "O filme da sessao e obrigatorio")
    Long filmeId,

    @NotNull(message = "A sala da sessao e obrigatoria")
    Long salaId,

    @NotNull(message = "O inicio da sessao e obrigatorio")
    LocalDateTime dataHoraInicio,

    @NotNull(message = "O fim da sessao e obrigatorio")
    LocalDateTime dataHoraFim,

    StatusSessao status
) {}