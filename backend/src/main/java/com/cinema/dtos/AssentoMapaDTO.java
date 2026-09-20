package com.cinema.dtos;

import com.cinema.enums.StatusIngresso;

// Status do assento no contexto da sessao:
// DISPONIVEL (livre), RESERVADO, VENDIDO/UTILIZADO (ocupado) ou INDISPONIVEL (manutencao).
public record AssentoMapaDTO(
    Long id,
    String fileira,
    Integer numero,
    StatusIngresso status
) {}