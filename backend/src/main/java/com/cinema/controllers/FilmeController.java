package com.cinema.controllers;

import com.cinema.dtos.FilmeRequestDTO;
import com.cinema.dtos.FilmeResponseDTO;
import com.cinema.services.FilmeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/filmes")
public class FilmeController {

    private final FilmeService service;

    public FilmeController(FilmeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FilmeResponseDTO>> listar(@RequestParam(required = false) String termo) {
        return ResponseEntity.ok(service.listar(termo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FilmeResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<FilmeResponseDTO> criar(@Valid @RequestBody FilmeRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }

    @PostMapping("/buscar")
    public ResponseEntity<FilmeResponseDTO> buscarNaOmdb(@RequestParam String titulo) {
        return ResponseEntity.ok(service.buscarEOuCadastrar(titulo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FilmeResponseDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody FilmeRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}