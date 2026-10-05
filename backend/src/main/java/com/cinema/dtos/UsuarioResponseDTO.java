package com.cinema.dtos;

import com.cinema.entities.Usuario;
import com.cinema.enums.PerfilUsuario;
import java.time.LocalDateTime;

public record UsuarioResponseDTO(
    Long id,
    String nome,
    String email,
    PerfilUsuario perfil,
    Boolean ativo,
    LocalDateTime dataCadastro,
    LocalDateTime dataAtualizacao
) {
    public static UsuarioResponseDTO fromEntity(Usuario u) {
        return new UsuarioResponseDTO(
            u.getId(),
            u.getNome(),
            u.getEmail(),
            u.getPerfil(),
            u.getAtivo(),
            u.getDataCadastro(),
            u.getDataAtualizacao()
        );
    }
}