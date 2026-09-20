package com.cinema.dtos;

import com.cinema.enums.StatusAssento;

public record AssentoRequestDTO(
    Long salaId,
    String fileira,
    Integer numero,
    StatusAssento status
) {}