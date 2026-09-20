package com.cinema.entities;

import com.cinema.enums.StatusIngresso;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "ingressos",
    uniqueConstraints = @UniqueConstraint(name = "uk_sessao_assento", columnNames = {"sessao_id", "assento_id"})
)
public class Ingresso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sessao_id", nullable = false)
    private Sessao sessao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assento_id", nullable = false)
    private Assento assento;

    // Placeholder da Fase 3: Usuario ainda nao existe em JPA (Fase 4).
    // Na Fase 4, sera substituido por ManyToOne -> Usuario.
    @Column(name = "nome_cliente", nullable = false, length = 100)
    private String nomeCliente;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusIngresso status;

    @Column(name = "data_compra")
    private LocalDateTime dataCompra;

    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    public Ingresso() {
    }

    public Ingresso(Long id, Sessao sessao, Assento assento, String nomeCliente, BigDecimal valor, StatusIngresso status) {
        this.id = id;
        this.sessao = sessao;
        this.assento = assento;
        this.nomeCliente = nomeCliente;
        this.valor = valor;
        this.status = status;
    }

    @PrePersist
    public void prePersist() {
        this.dataCadastro = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
        if (this.status == StatusIngresso.VENDIDO) {
            this.dataCompra = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Sessao getSessao() { return sessao; }
    public void setSessao(Sessao sessao) { this.sessao = sessao; }

    public Assento getAssento() { return assento; }
    public void setAssento(Assento assento) { this.assento = assento; }

    public String getNomeCliente() { return nomeCliente; }
    public void setNomeCliente(String nomeCliente) { this.nomeCliente = nomeCliente; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public StatusIngresso getStatus() { return status; }
    public void setStatus(StatusIngresso status) { this.status = status; }

    public LocalDateTime getDataCompra() { return dataCompra; }
    public void setDataCompra(LocalDateTime dataCompra) { this.dataCompra = dataCompra; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}