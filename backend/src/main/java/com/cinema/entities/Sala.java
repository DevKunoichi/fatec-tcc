package com.cinema.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "salas")
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_numero", nullable = false, unique = true, length = 50)
    private String nomeNumero;

    @Column(name = "capacidade_total", nullable = false)
    private Integer capacidadeTotal;

    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    public Sala() {
    }

    public Sala(Long id, String nomeNumero, Integer capacidadeTotal) {
        this.id = id;
        this.nomeNumero = nomeNumero;
        this.capacidadeTotal = capacidadeTotal;
    }

    @PrePersist
    public void prePersist() {
        this.dataCadastro = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeNumero() { return nomeNumero; }
    public void setNomeNumero(String nomeNumero) { this.nomeNumero = nomeNumero; }

    public Integer getCapacidadeTotal() { return capacidadeTotal; }
    public void setCapacidadeTotal(Integer capacidadeTotal) { this.capacidadeTotal = capacidadeTotal; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}