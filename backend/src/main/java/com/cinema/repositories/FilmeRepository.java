package com.cinema.repositories;

import com.cinema.entities.Filme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FilmeRepository extends JpaRepository<Filme, Long> {

    Optional<Filme> findByImdbId(String imdbId);

    List<Filme> findByTituloContainingIgnoreCase(String termo);

    List<Filme> findAllByOrderByTituloAsc();
}