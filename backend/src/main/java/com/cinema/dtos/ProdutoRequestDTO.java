package com.cinema.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProdutoRequestDTO(
    @NotBlank(message = "O nome do produto e obrigatorio")
    String nome,

    @NotBlank(message = "A categoria e obrigatoria (ex: Pipocas, Bebidas, Doces, Combos)")
    String categoria,

    String unidade,

    @NotNull(message = "O preco unitario e obrigatorio")
    @DecimalMin(value = "0.01", message = "O preco deve ser maior que zero")
    BigDecimal preco,

    @NotNull(message = "A quantidade inicial em estoque e obrigatoria")
    @Min(value = 0, message = "A quantidade de estoque nao pode ser negativa")
    Integer quantidadeEstoque,

    @Min(value = 0, message = "O estoque minimo nao pode ser negativo")
    Integer estoqueMinimo
) {}
