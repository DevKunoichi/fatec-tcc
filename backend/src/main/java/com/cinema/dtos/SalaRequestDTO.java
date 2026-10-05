package com.cinema.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SalaRequestDTO(
    @NotBlank(message = "O nome/numero da sala e obrigatorio")
    String nomeNumero,

    @NotNull(message = "A capacidade total da sala e obrigatoria")
    @Min(value = 1, message = "A capacidade total deve ser maior que zero")
    Integer capacidadeTotal
) {}