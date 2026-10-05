package com.cinema.dtos;

import com.cinema.entities.Assento;
import com.cinema.enums.StatusAssento;
import java.time.LocalDateTime;

public record AssentoResponseDTO(
    Long id,
    SalaResponseDTO sala,
    String fileira,
    Integer numero,
    StatusAssento status,
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static AssentoResponseDTO fromEntity(Assento a) {
        return new AssentoResponseDTO(
            a.getId(),
            SalaResponseDTO.fromEntity(a.getSala()),
            a.getFileira(),
            a.getNumero(),
            a.getStatus(),
            a.getDataCadastro(),
            a.getDataAtualizacao()
        );
    }
}