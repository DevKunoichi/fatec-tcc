package com.cinema.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO que espelha a resposta da API OMDb (https://www.omdbapi.com/).
 * Os campos desconhecidos (Year, Release, Actors, etc.) sao simplesmente
 * ignorados pelo Jackson na desserializacao.
 */
public record OmdbMovieResponse(
    @JsonProperty("Title") String title,
    @JsonProperty("Year") String year,
    @JsonProperty("Rated") String rated,
    @JsonProperty("Runtime") String runtime,
    @JsonProperty("Genre") String genre,
    @JsonProperty("Director") String director,
    @JsonProperty("Actors") String actors,
    @JsonProperty("Plot") String plot,
    @JsonProperty("Poster") String poster,
    @JsonProperty("imdbID") String imdbId,
    @JsonProperty("Response") String response,
    @JsonProperty("Error") String error
) {
    public boolean ok() {
        return "True".equalsIgnoreCase(response);
    }
}