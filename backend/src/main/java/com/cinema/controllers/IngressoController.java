package com.cinema.controllers;

import com.cinema.dtos.AssentosDaSessaoDTO;
import com.cinema.dtos.IngressoCompraDTO;
import com.cinema.dtos.IngressoRequestDTO;
import com.cinema.dtos.IngressoResponseDTO;
import com.cinema.services.IngressoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingressos")
public class IngressoController {

    private final IngressoService service;

    public IngressoController(IngressoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<IngressoResponseDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngressoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<IngressoResponseDTO> criar(@Valid @RequestBody IngressoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @PostMapping("/comprar")
    public ResponseEntity<List<IngressoResponseDTO>> comprar(@Valid @RequestBody IngressoCompraDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.comprar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngressoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody IngressoRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessoes/{sessaoId}")
    public ResponseEntity<List<IngressoResponseDTO>> listarPorSessao(@PathVariable Long sessaoId) {
        return ResponseEntity.ok(service.listarPorSessao(sessaoId));
    }

    @GetMapping("/sessoes/{sessaoId}/assentos")
    public ResponseEntity<AssentosDaSessaoDTO> mapaDaSessao(@PathVariable Long sessaoId) {
        return ResponseEntity.ok(service.mapaDaSessao(sessaoId));
    }
}