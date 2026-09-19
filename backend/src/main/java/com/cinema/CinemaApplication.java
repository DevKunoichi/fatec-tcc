package com.cinema;

import com.cinema.entities.Filme;
import com.cinema.entities.Produto;
import com.cinema.entities.Sala;
import com.cinema.repositories.FilmeRepository;
import com.cinema.repositories.ProdutoRepository;
import com.cinema.repositories.SalaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class CinemaApplication {

    public static void main(String[] args) {
        SpringApplication.run(CinemaApplication.class, args);
    }

    /**
     * Carga inicial com produtos do snack bar para testes imediatos (Seed)
     */
    @Bean
    CommandLineRunner seedDatabase(ProdutoRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Produto(null, "Pipoca Grande Salgada", "Pipocas", "Balde 200g", new BigDecimal("24.00"), 45, 10));
                repository.save(new Produto(null, "Pipoca Media Manteiga", "Pipocas", "Saco 120g", new BigDecimal("18.50"), 28, 10));
                repository.save(new Produto(null, "Coca-Cola Lata 350ml", "Bebidas", "Lata", new BigDecimal("9.00"), 80, 20));
                repository.save(new Produto(null, "Agua Mineral s/ Gas 500ml", "Bebidas", "Garrafa", new BigDecimal("6.00"), 50, 15));
                repository.save(new Produto(null, "Chocolate Confete 80g", "Doces", "Pacote", new BigDecimal("12.00"), 35, 8));
                repository.save(new Produto(null, "Nachos com Queijo Cheddar", "Combos", "Porcao", new BigDecimal("28.00"), 15, 5));
                repository.save(new Produto(null, "Combo Classico (Pipoca G + Refri)", "Combos", "Combo", new BigDecimal("32.00"), 20, 5));
                System.out.println(">> [SEED] Banco populado com 7 produtos iniciais no Snack Bar!");
            }
        };
    }

    /**
     * Carga inicial de salas para testes imediatos (Seed)
     */
    @Bean
    CommandLineRunner seedSalas(SalaRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Sala(null, "Sala 1 - Padrao", 100));
                repository.save(new Sala(null, "Sala 2 - IMAX", 250));
                repository.save(new Sala(null, "Sala 3 - VIP", 150));
                System.out.println(">> [SEED] Banco populado com 3 salas iniciais!");
            }
        };
    }

    /**
     * Carga inicial de filmes do catalogo para testes imediatos (Seed)
     * Obs: ao configurar a OMDB_API_KEY, os novos filmes podem ser consultados
     * automaticamente via POST /api/filmes/buscar.
     */
    @Bean
    CommandLineRunner seedFilmes(FilmeRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Filme(null, "O Auto da Compadecida 2", "14", 124, "Joao Grilo e Chicó retornam para novas aventuras no Nordeste.", "Comedia, Aventura", null, null, null));
                repository.save(new Filme(null, "Duna: Parte 2", "12", 166, "Paul Atreides se une aos Fremen e busca vinganca contra os Harkonnen.", "Ficcao, Aventura, Drama", null, null, null));
                repository.save(new Filme(null, "Deadpool & Wolverine", "18", 128, "Wolverine e Deadpool unem forcas em uma aventura pelo multiverso.", "Acao, Comedia, Ficcao", null, null, null));
                System.out.println(">> [SEED] Banco populado com 3 filmes iniciais no Catalogo!");
            }
        };
    }
}
