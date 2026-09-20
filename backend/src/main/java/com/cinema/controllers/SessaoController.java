package com.cinema.controllers;

import com.cinema.dtos.AssentosDaSessaoDTO;
import com.cinema.dtos.SessaoRequestDTO;
import com.cinema.dtos.SessaoResponseDTO;
import com.cinema.services.IngressoService;
import com.cinema.services.SessaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessoes")
public class SessaoController {

    private final SessaoService service;
    private final IngressoService ingressoService;

    public SessaoController(SessaoService service, IngressoService ingressoService) {
        this.service = service;
        this.ingressoService = ingressoService;
    }

    @GetMapping("/{id}/assentos")
    public ResponseEntity<AssentosDaSessaoDTO> mapaAssentos(@PathVariable Long id) {
        return ResponseEntity.ok(ingressoService.mapaDaSessao(id));
    }

    @GetMapping
    public ResponseEntity<List<SessaoResponseDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessaoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<SessaoResponseDTO> criar(@Valid @RequestBody SessaoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessaoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody SessaoRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}