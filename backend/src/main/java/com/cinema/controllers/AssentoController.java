package com.cinema.controllers;

import com.cinema.dtos.AssentoRequestDTO;
import com.cinema.dtos.AssentoResponseDTO;
import com.cinema.services.AssentoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assentos")
public class AssentoController {

    private final AssentoService service;

    public AssentoController(AssentoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AssentoResponseDTO>> listar(@RequestParam(required = false) Long salaId) {
        return ResponseEntity.ok(service.listar(salaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssentoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<AssentoResponseDTO> criar(@Valid @RequestBody AssentoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssentoResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AssentoRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}