package com.cinema.dtos;

import com.cinema.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO de ATUALIZACAO: todos os campos sao opcionais (PUT parcial, igual ao mock).
 * Na criacao use UsuarioRequestDTO (que exige nome/email).
 */
public record UsuarioUpdateDTO(
    @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres")
    String nome,

    @Email(message = "Email invalido")
    @Size(max = 120, message = "O email deve ter no maximo 120 caracteres")
    String email,

    @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres")
    String senha,

    PerfilUsuario perfil,

    Boolean ativo
) {}