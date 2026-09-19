package com.cinema.repositories;

import com.cinema.entities.Sessao;
import com.cinema.enums.StatusSessao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, Long> {

    List<Sessao> findBySalaIdAndDataHoraInicioBetween(Long salaId, LocalDateTime inicio, LocalDateTime fim);

    List<Sessao> findByFilmeId(Long filmeId);

    @Query("SELECT s FROM Sessao s WHERE s.sala.id = :salaId AND s.status <> :statusCancelada AND s.id <> :idSelf AND s.dataHoraInicio < :fim AND s.dataHoraFim > :inicio")
    List<Sessao> findConflitantes(@Param("salaId") Long salaId,
                                  @Param("statusCancelada") StatusSessao statusCancelada,
                                  @Param("inicio") LocalDateTime inicio,
                                  @Param("fim") LocalDateTime fim,
                                  @Param("idSelf") Long idSelf);
}