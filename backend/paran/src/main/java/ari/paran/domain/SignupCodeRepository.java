package ari.paran.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface SignupCodeRepository extends JpaRepository<SignupCode, Long> {
    Optional<SignupCode> findByCode(String code);
    boolean existsByCode(String code);
}
