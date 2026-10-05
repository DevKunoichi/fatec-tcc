package com.cinema.repositories;

import com.cinema.entities.Ingresso;
import com.cinema.enums.StatusIngresso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface IngressoRepository extends JpaRepository<Ingresso, Long> {

    List<Ingresso> findBySessaoId(Long sessaoId);

    Optional<Ingresso> findBySessaoIdAndAssentoId(Long sessaoId, Long assentoId);

    List<Ingresso> findBySessaoIdAndAssentoIdIn(Long sessaoId, Collection<Long> assentoIds);

    long countBySessaoIdAndStatusIn(Long sessaoId, Collection<StatusIngresso> statuses);

    boolean existsByAssentoId(Long assentoId);
}