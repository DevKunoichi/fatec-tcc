package com.cinema.dtos;

import com.cinema.enums.StatusIngresso;
import java.math.BigDecimal;

public record IngressoRequestDTO(
    Long sessaoId,
    Long assentoId,
    String nomeCliente,
    BigDecimal valor,
    StatusIngresso status
) {}