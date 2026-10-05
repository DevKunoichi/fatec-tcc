package com.cinema.controllers;

import com.cinema.dtos.UsuarioRequestDTO;
import com.cinema.dtos.UsuarioResponseDTO;
import com.cinema.dtos.UsuarioUpdateDTO;
import com.cinema.security.AuthUserDetails;
import com.cinema.security.SecurityUtils;
import com.cinema.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listar(@RequestParam(required = false) String busca) {
        return ResponseEntity.ok(service.listar(busca));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(@Valid @RequestBody UsuarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Long id,
                                                        @Valid @RequestBody UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Long idSolicitante = SecurityUtils.autenticado()
                .map(AuthUserDetails::getUsuarioId)
                .orElse(-1L);
        service.excluir(id, idSolicitante);
        return ResponseEntity.noContent().build();
    }
}