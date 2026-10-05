package com.cinema.dtos;

import com.cinema.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDTO(
    @NotBlank(message = "O nome e obrigatorio")
    @Size(max = 100, message = "O nome deve ter no maximo 100 caracteres")
    String nome,

    @NotBlank(message = "O email e obrigatorio")
    @Email(message = "Email invalido")
    @Size(max = 120, message = "O email deve ter no maximo 120 caracteres")
    String email,

    @Size(min = 6, message = "A senha deve ter ao menos 6 caracteres")
    String senha,

    PerfilUsuario perfil,

    Boolean ativo
) {}