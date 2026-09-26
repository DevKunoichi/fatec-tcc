package com.cinema.controllers;

import com.cinema.dtos.LoginRequestDTO;
import com.cinema.dtos.LoginResponseDTO;
import com.cinema.dtos.UsuarioResponseDTO;
import com.cinema.entities.Usuario;
import com.cinema.security.AuthUserDetails;
import com.cinema.security.JwtUtil;
import com.cinema.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioService usuarioService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.email().trim(), dto.senha())
            );
            AuthUserDetails principal = (AuthUserDetails) authentication.getPrincipal();
            Usuario usuario = usuarioService.buscarEntidadePorEmail(principal.getUsername());
            return ResponseEntity.ok(new LoginResponseDTO(
                    jwtUtil.gerarToken(usuario),
                    jwtUtil.getExpiration(),
                    UsuarioResponseDTO.fromEntity(usuario)
            ));
        } catch (BadCredentialsException | DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "error", "Credenciais Invalidas",
                    "message", "Email ou senha invalidos."
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserDetails principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "error", "Nao Autorizado",
                    "message", "Autentique-se para acessar este recurso."
            ));
        }
        Usuario usuario = usuarioService.buscarEntidadePorEmail(principal.getUsername());
        return ResponseEntity.ok(UsuarioResponseDTO.fromEntity(usuario));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUserDetails principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", 401,
                    "error", "Nao Autorizado",
                    "message", "Token invalido ou expirado."
            ));
        }
        Usuario usuario = usuarioService.buscarEntidadePorEmail(principal.getUsername());
        return ResponseEntity.ok(new LoginResponseDTO(
                jwtUtil.gerarToken(usuario),
                jwtUtil.getExpiration(),
                UsuarioResponseDTO.fromEntity(usuario)
        ));
    }
}