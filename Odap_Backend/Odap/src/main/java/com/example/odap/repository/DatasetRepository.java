package com.example.odap.repository;

import com.example.odap.entity.Dataset;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class DatasetRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final AtomicLong idCounter = new AtomicLong(20);

    private final RowMapper<Dataset> rowMapper=(rs,rowNum)->{
        Dataset dataset=new Dataset();
        dataset.setId(rs.getLong("id"));
        dataset.setDatasetName(rs.getString("dataset_name"));
        dataset.setPublisherId(rs.getLong("publisher_id"));
        dataset.setPubTime(rs.getString("pub_time"));
        dataset.setDescription(rs.getString("description"));
        dataset.setSampleType(rs.getString("sample_type"));
        dataset.setSampleSize(rs.getDouble("sample_size"));
        dataset.setTagType(rs.getString("tag_type"));
        dataset.setFilePath(rs.getString("file_path"));
        return dataset;
    };
    public long count(){
        String sql="SELECT COUNT(*) FROM dataset";
        return jdbcTemplate.queryForObject(sql, Long.class);
    }

    public Dataset save(Dataset dataset) {
        long uniqueID = idCounter.incrementAndGet();
        dataset.setId(uniqueID);
        // Use PreparedStatementCreator to specify the generated keys column
        PreparedStatementCreator psc = connection -> {
            String sql = "INSERT INTO dataset (id, dataset_name, publisher_id, pub_time, description, sample_type, sample_size, tag_type, file_path) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement ps = connection.prepareStatement(sql);
            ps.setLong(1, dataset.getId());
            ps.setString(2, dataset.getDatasetName());
            ps.setLong(3, dataset.getPublisherId());
            ps.setString(4, dataset.getPubTime());
            ps.setString(5, dataset.getDescription());
            ps.setString(6, dataset.getSampleType());
            ps.setDouble(7, dataset.getSampleSize());
            ps.setString(8, dataset.getTagType());
            ps.setString(9, dataset.getFilePath());
            return ps;
        };

        jdbcTemplate.update(psc);

        return dataset;
    }


    public Page<Dataset> findAll(Pageable pageable) {
        String sql = "SELECT * FROM dataset LIMIT ? OFFSET ?";

        List<Dataset> datasets = jdbcTemplate.query(
                sql,
                new Object[]{pageable.getPageSize(), pageable.getOffset()},
                new BeanPropertyRowMapper<>(Dataset.class));

        String countQuery = "SELECT COUNT(*) FROM dataset";
        int total = jdbcTemplate.queryForObject(countQuery, Integer.class);

        return new PageImpl<>(datasets, pageable, total);
    }
    public Dataset findById(Long id) {
        String sql = "SELECT * FROM dataset WHERE id = ?";

        List<Dataset> datasets = jdbcTemplate.query(
                sql,
                new Object[]{id},
                new BeanPropertyRowMapper<>(Dataset.class));

        return datasets.isEmpty() ? null : datasets.get(0);
    }
    public void delete(Dataset dataset) {
        String sql = "DELETE FROM dataset WHERE id = ?";
        jdbcTemplate.update(sql, dataset.getId());
    }


    public Dataset findByDatasetName(String datasetName){
        String sql="SELECT * FROM dataset where dataset_name=?";
        return jdbcTemplate.queryForObject(sql,new Object[]{datasetName},rowMapper);
    }
    public boolean existsByDatasetName(String datasetName){
        String sql = "SELECT COUNT(*) FROM dataset WHERE dataset_name = ?";
        Integer count = jdbcTemplate.queryForObject(sql, new Object[]{datasetName}, Integer.class);
        return count != null && count > 0;
    }
    public Page<Dataset> findByPublisherId(Long publisherId, Pageable pageable){
        String sql = "SELECT * FROM dataset WHERE publisher_id = ? LIMIT ? OFFSET ?";
        List<Dataset> datasets = jdbcTemplate.query(
                sql,
                new Object[]{publisherId, pageable.getPageSize(), pageable.getOffset()},
                rowMapper
        );
        String countQuery = "SELECT COUNT(*) FROM dataset WHERE publisher_id = ?";
        Integer totalCount = jdbcTemplate.queryForObject(countQuery, new Object[]{publisherId}, Integer.class);

        return new PageImpl<>(datasets, pageable, totalCount == null ? 0 : totalCount);
    }

}
