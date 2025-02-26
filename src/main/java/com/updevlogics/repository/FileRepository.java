package com.updevlogics.repository;

import com.updevlogics.model.FileInfo;
import org.springframework.stereotype.Repository;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Repository
public class FileRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public void saveFile(FileInfo fileInfo) {
        entityManager.persist(fileInfo);
    }

    public List<FileInfo> getAllFiles() {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<FileInfo> cq = cb.createQuery(FileInfo.class);
        Root<FileInfo> rootEntry = cq.from(FileInfo.class);
        CriteriaQuery<FileInfo> all = cq.select(rootEntry);
        return entityManager.createQuery(all).getResultList();
    }

    public List<FileInfo> searchFiles(String query, String fileType, String role, Date dateFrom, Date dateTo, String category, String subCategory) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<FileInfo> cq = cb.createQuery(FileInfo.class);
        Root<FileInfo> file = cq.from(FileInfo.class);

        List<Predicate> predicates = new ArrayList<>();

        if (query != null && !query.isEmpty()) {
            predicates.add(cb.like(file.get("fileName"), "%" + query + "%"));
        }

        if (fileType != null && !fileType.isEmpty()) {
            predicates.add(cb.equal(file.get("fileType"), fileType));
        }

        if (role != null && !role.isEmpty()) {
            predicates.add(cb.equal(file.get("role"), role));
        }

        if (dateFrom != null) {
            predicates.add(cb.greaterThanOrEqualTo(file.get("uploadDate"), dateFrom));
        }

        if (dateTo != null) {
            predicates.add(cb.lessThanOrEqualTo(file.get("uploadDate"), dateTo));
        }

        if (category != null && !category.isEmpty()) {
            predicates.add(cb.equal(file.get("category"), category));
        }

        if (subCategory != null && !subCategory.isEmpty()) {
            predicates.add(cb.equal(file.get("subCategory"), subCategory));
        }

        cq.where(predicates.toArray(new Predicate[0]));
        return entityManager.createQuery(cq).getResultList();
    }

    public List<FileInfo> getLast10Files() {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<FileInfo> cq = cb.createQuery(FileInfo.class);
        Root<FileInfo> root = cq.from(FileInfo.class);
        cq.orderBy(cb.desc(root.get("uploadDate")));
        return entityManager.createQuery(cq).setMaxResults(10).getResultList();
    }
}