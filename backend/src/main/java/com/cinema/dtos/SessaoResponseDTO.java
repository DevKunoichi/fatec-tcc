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
    public static SessaoResponseDTO fromEntity(Sessao s) {
        // Ingressos ainda nao existem (Fase 3); por ora nenhum assento foi vendido.
        int ingressosVendidos = 0;
        int vagasDisponiveis = s.getSala().getCapacidadeTotal() - ingressosVendidos;
        return new SessaoResponseDTO(
            s.getId(),
            FilmeResponseDTO.fromEntity(s.getFilme()),
            SalaResponseDTO.fromEntity(s.getSala()),
            s.getDataHoraInicio(),
            s.getDataHoraFim(),
            s.getStatus(),
            ingressosVendidos,
            vagasDisponiveis,
            s.getDataCadastro(),
            s.getDataAtualizacao()
        );
    }
}