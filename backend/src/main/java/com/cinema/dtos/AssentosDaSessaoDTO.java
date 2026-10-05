package com.cinema.dtos;

import java.time.LocalDateTime;
import java.util.List;

public record AssentosDaSessaoDTO(
    Long sessaoId,
    FilmeResponseDTO filme,
    SalaResponseDTO sala,
    LocalDateTime dataHoraInicio,
    int ingressosVendidos,
    int vagasDisponiveis,
    List<AssentoMapaDTO> assentos
) {}