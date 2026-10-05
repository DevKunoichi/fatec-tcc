package com.cinema.dtos;

import com.cinema.entities.Sala;
import java.time.LocalDateTime;

public record SalaResponseDTO(
    Long id,
    String nomeNumero,
    Integer capacidadeTotal,
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static SalaResponseDTO fromEntity(Sala s) {
        return new SalaResponseDTO(
            s.getId(),
            s.getNomeNumero(),
            s.getCapacidadeTotal(),
            s.getDataCadastro(),
            s.getDataAtualizacao()
        );
    }
}