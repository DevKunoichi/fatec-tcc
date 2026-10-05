package com.cinema.dtos;

import com.cinema.entities.Ingresso;
import com.cinema.enums.StatusIngresso;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record IngressoResponseDTO(
    Long id,
    Long sessaoId,
    Long assentoId,
    String fileira,
    Integer numero,
    Long usuarioId,
    String nomeCliente,
    BigDecimal valor,
    StatusIngresso status,
    LocalDateTime dataCompra,
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static IngressoResponseDTO fromEntity(Ingresso i) {
        return new IngressoResponseDTO(
            i.getId(),
            i.getSessao().getId(),
            i.getAssento().getId(),
            i.getAssento().getFileira(),
            i.getAssento().getNumero(),
            i.getUsuario() != null ? i.getUsuario().getId() : null,
            i.getNomeCliente(),
            i.getValor(),
            i.getStatus(),
            i.getDataCompra(),
            i.getDataCadastro(),
            i.getDataAtualizacao()
        );
    }
}