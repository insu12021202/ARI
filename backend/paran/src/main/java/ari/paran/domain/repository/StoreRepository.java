package ari.paran.domain.repository;

import ari.paran.domain.member.Member;
import ari.paran.domain.store.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByName(String name);
    Optional<Store> findById(Long name);

    List<Store> findAllByMember(Member member);

    @Query("SELECT s FROM Store s WHERE s.name = :storeName AND s.member = :member")
    Store findStoreByNameAndMember(@Param("storeName") String name,
                                   @Param("member") Member member);
}