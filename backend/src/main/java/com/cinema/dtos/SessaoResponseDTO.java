package com.cinema.dtos;

import com.cinema.entities.Sessao;
import com.cinema.enums.StatusSessao;
import java.time.LocalDateTime;

public record SessaoResponseDTO(
    Long id,
    FilmeResponseDTO filme,
    SalaResponseDTO sala,
    LocalDateTime dataHoraInicio,
    LocalDateTime dataHoraFim,
    StatusSessao status,
    int ingressosVendidos,
    int vagasDisponiveis,
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static SessaoResponseDTO fromEntity(Sessao s, int ingressosVendidos) {
        int vendidos = Math.max(0, ingressosVendidos);
        int vagasDisponiveis = s.getSala().getCapacidadeTotal() - vendidos;
        return new SessaoResponseDTO(
            s.getId(),
            FilmeResponseDTO.fromEntity(s.getFilme()),
            SalaResponseDTO.fromEntity(s.getSala()),
            s.getDataHoraInicio(),
            s.getDataHoraFim(),
            s.getStatus(),
            vendidos,
            vagasDisponiveis,
            s.getDataCadastro(),
            s.getDataAtualizacao()
        );
    }
}