package com.cinema.entities;

import com.cinema.enums.StatusAssento;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "assentos",
    uniqueConstraints = @UniqueConstraint(name = "uk_sala_fileira_numero", columnNames = {"sala_id", "fileira", "numero"})
)
public class Assento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sala_id", nullable = false)
    private Sala sala;

    @Column(nullable = false, length = 5)
    private String fileira;

    @Column(nullable = false)
    private Integer numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAssento status;

    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    public Assento() {
    }

    public Assento(Long id, Sala sala, String fileira, Integer numero, StatusAssento status) {
        this.id = id;
        this.sala = sala;
        this.fileira = fileira;
        this.numero = numero;
        this.status = status;
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

    public Sala getSala() { return sala; }
    public void setSala(Sala sala) { this.sala = sala; }

    public String getFileira() { return fileira; }
    public void setFileira(String fileira) { this.fileira = fileira; }

    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }

    public StatusAssento getStatus() { return status; }
    public void setStatus(StatusAssento status) { this.status = status; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}