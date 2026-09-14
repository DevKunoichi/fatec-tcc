package com.cinema.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MovimentacaoEstoqueDTO(
    @NotBlank(message = "O tipo de movimentacao e obrigatorio ('ENTRADA' ou 'SAIDA')")
    String tipo,

    @NotNull(message = "A quantidade e obrigatoria")
    @Min(value = 1, message = "A quantidade deve ser de no minimo 1 unidade")
    Integer quantidade,

    String motivo
) {}
