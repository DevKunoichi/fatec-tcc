package com.cinema.dtos;

import java.math.BigDecimal;
import java.util.List;

public record IngressoCompraDTO(
    Long sessaoId,
    List<Long> assentoIds,
    String nomeCliente,
    BigDecimal valor
) {}