package com.cinema.dtos;

public record LoginResponseDTO(
    String token,
    long expiresIn,
    UsuarioResponseDTO usuario
) {}