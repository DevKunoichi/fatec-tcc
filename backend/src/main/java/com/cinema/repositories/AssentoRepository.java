package com.cinema.repositories;

import com.cinema.entities.Assento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssentoRepository extends JpaRepository<Assento, Long> {

    List<Assento> findBySalaIdOrderByFileiraAscNumeroAsc(Long salaId);

    List<Assento> findBySalaId(Long salaId);

    Optional<Assento> findBySalaIdAndFileiraAndNumero(Long salaId, String fileira, Integer numero);

    long countBySalaId(Long salaId);

    boolean existsBySalaIdAndFileiraAndNumero(Long salaId, String fileira, Integer numero);
}