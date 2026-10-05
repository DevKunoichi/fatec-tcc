package com.cinema.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "filmes")
public class Filme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titulo;

    @Column(name = "classificacao_etaria", length = 20)
    private String classificacaoEtaria;

    @Column(name = "duracao_minutos")
    private Integer duracaoMinutos;

    @Column(columnDefinition = "TEXT")
    private String sinopse;

    @Column(length = 100)
    private String genero;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(length = 200)
    private String diretor;

    @Column(name = "imdb_id", unique = true, length = 30)
    private String imdbId;

    @Column(name = "data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    public Filme() {
    }

    public Filme(Long id, String titulo, String classificacaoEtaria, Integer duracaoMinutos, String sinopse, String genero, String posterUrl, String diretor, String imdbId) {
        this.id = id;
        this.titulo = titulo;
        this.classificacaoEtaria = classificacaoEtaria;
        this.duracaoMinutos = duracaoMinutos;
        this.sinopse = sinopse;
        this.genero = genero;
        this.posterUrl = posterUrl;
        this.diretor = diretor;
        this.imdbId = imdbId;
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

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getClassificacaoEtaria() { return classificacaoEtaria; }
    public void setClassificacaoEtaria(String classificacaoEtaria) { this.classificacaoEtaria = classificacaoEtaria; }

    public Integer getDuracaoMinutos() { return duracaoMinutos; }
    public void setDuracaoMinutos(Integer duracaoMinutos) { this.duracaoMinutos = duracaoMinutos; }

    public String getSinopse() { return sinopse; }
    public void setSinopse(String sinopse) { this.sinopse = sinopse; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getDiretor() { return diretor; }
    public void setDiretor(String diretor) { this.diretor = diretor; }

    public String getImdbId() { return imdbId; }
    public void setImdbId(String imdbId) { this.imdbId = imdbId; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public LocalDateTime getDataAtualizacao() { return dataAtualizacao; }
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) { this.dataAtualizacao = dataAtualizacao; }
}