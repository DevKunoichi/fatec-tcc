package com.cinema;

import com.cinema.entities.Filme;
import com.cinema.entities.Produto;
import com.cinema.entities.Sala;
import com.cinema.entities.Sessao;
import com.cinema.entities.Usuario;
import com.cinema.enums.PerfilUsuario;
import com.cinema.enums.StatusSessao;
import com.cinema.repositories.FilmeRepository;
import com.cinema.repositories.ProdutoRepository;
import com.cinema.repositories.SalaRepository;
import com.cinema.repositories.SessaoRepository;
import com.cinema.repositories.UsuarioRepository;
import com.cinema.services.AssentoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class CinemaApplication {

    public static void main(String[] args) {
        SpringApplication.run(CinemaApplication.class, args);
    }

    /**
     * Carga inicial com produtos do snack bar para testes imediatos (Seed)
     */
    @Bean
    @Order(1)
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
    @Order(2)
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
    @Order(3)
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

    /**
     * Carga inicial de sessoes (normalizada com FK de filme e sala).
     * Requer filme e salas previamente cadastrados.
     */
    @Bean
    @Order(4)
    CommandLineRunner seedSessoes(SessaoRepository sessaoRepository,
                                  FilmeRepository filmeRepository,
                                  SalaRepository salaRepository) {
        return args -> {
            if (sessaoRepository.count() > 0) return;

            List<Filme> filmes = filmeRepository.findAll();
            List<Sala> salas = salaRepository.findAll();
            if (filmes.isEmpty() || salas.isEmpty()) return;

            LocalDateTime hoje = LocalDateTime.now().withNano(0).withSecond(0);
            Sessao s1 = new Sessao(null, filmes.get(0), salas.get(0), hoje.withHour(18), hoje.withHour(20).plusMinutes(4), StatusSessao.DISPONIVEL);
            Sessao s2 = new Sessao(null, filmes.get(1), salas.get(1), hoje.withHour(20).plusMinutes(30), hoje.withHour(23).plusMinutes(16), StatusSessao.DISPONIVEL);
            Sessao s3 = new Sessao(null, filmes.get(2), salas.get(2), hoje.withHour(21), hoje.withHour(23).plusMinutes(8), StatusSessao.ENCERRADA);
            sessaoRepository.saveAll(List.of(s1, s2, s3));
            System.out.println(">> [SEED] Banco populado com 3 sessoes iniciais!");
        };
    }

    /**
     * Garante que toda sala possui o grid de assentos (backfill da Fase 3).
     * Executa apos salas e sessoes, tambem cobre salas criadas nas fases anteriores.
     */
    @Bean
    @Order(5)
    CommandLineRunner seedAssentosDaSala(SalaRepository salaRepository, AssentoService assentoService) {
        return args -> {
            for (Sala sala : salaRepository.findAll()) {
                assentoService.gerarAssentosParaSala(sala);
            }
            System.out.println(">> [SEED] Assentos das salas verificados (backfill executado).");
        };
    }

    /**
     * Usuario administrador inicial (Fase 4). Senha gravada com BCrypt (nunca em texto puro).
     * Credenciais padrao: admin@cinemax.com.br / admin123
     */
    @Bean
    @Order(6)
    CommandLineRunner seedUsuarioAdmin(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Usuario(
                    null,
                    "Administrador Cinemax",
                    "admin@cinemax.com.br",
                    passwordEncoder.encode("admin123"),
                    PerfilUsuario.ADMIN,
                    true
                ));
                System.out.println(">> [SEED] Usuario admin criado (admin@cinemax.com.br / admin123).");
            }
        };
    }
}
