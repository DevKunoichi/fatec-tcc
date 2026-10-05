package com.cinema.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

/**
 * Principal de autenticacao: alem de username/autorities do Spring Security,
 * carrega o id e o nome do Usuario para uso em servicos (ex.: vincular ingresso).
 */
public class AuthUserDetails extends User {

    private final Long usuarioId;
    private final String nome;

    public AuthUserDetails(Long usuarioId, String nome, String email, String senhaHash,
                           Collection<? extends GrantedAuthority> authorities) {
        super(email, senhaHash, authorities);
        this.usuarioId = usuarioId;
        this.nome = nome;
    }

    public Long getUsuarioId() { return usuarioId; }
    public String getNome() { return nome; }
}