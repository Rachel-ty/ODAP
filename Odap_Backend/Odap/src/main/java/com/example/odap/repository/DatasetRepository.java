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
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class DatasetRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

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
        if (dataset.getId() == null) {
            // Insert a new dataset
            KeyHolder keyHolder = new GeneratedKeyHolder();
            String sql = "INSERT INTO dataset (dataset_name, publisher_id, pub_time, description, sample_type, sample_size, tag_type, file_path) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, dataset.getDatasetName());
                ps.setLong(2, dataset.getPublisherId());
                ps.setString(3, dataset.getPubTime());
                ps.setString(4, dataset.getDescription());
                ps.setString(5, dataset.getSampleType());
                ps.setDouble(6, dataset.getSampleSize());
                ps.setString(7, dataset.getTagType());
                ps.setString(8, dataset.getFilePath());
                return ps;
            }, keyHolder);

            // Set the generated ID back to the dataset
            Long generatedId = (Long) keyHolder.getKeys().get("id");
            dataset.setId(generatedId);

            // Return the updated dataset
            return dataset;
        } else {
            // Update an existing dataset
            String sql = "UPDATE dataset SET dataset_name = ?, publisher_id = ?, pub_time = ?, description = ?, " +
                    "sample_type = ?, sample_size = ?, tag_type = ?, file_path = ? WHERE id = ?";
            jdbcTemplate.update(
                    sql,
                    dataset.getDatasetName(),
                    dataset.getPublisherId(),
                    dataset.getPubTime(),
                    dataset.getDescription(),
                    dataset.getSampleType(),
                    dataset.getSampleSize(),
                    dataset.getTagType(),
                    dataset.getFilePath(),
                    dataset.getId());

            // Return the updated dataset
            return dataset;
        }
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
