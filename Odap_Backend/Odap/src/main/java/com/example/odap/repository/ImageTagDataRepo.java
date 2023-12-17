package com.example.odap.repository;
import com.example.odap.entity.TagData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public class ImageTagDataRepo {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<TagData> findByDatasetIdAndSampleId(String datasetId, String sampleId) {
        String sql = "SELECT * FROM image_data WHERE dataset_id = ? AND sample_id = ?";
        return jdbcTemplate.query(sql, new Object[]{datasetId, sampleId}, new BeanPropertyRowMapper<>(TagData.class));
    }
    public List<TagData> findByDatasetId(String datasetId) {
        String sql = "SELECT * FROM image_data WHERE dataset_id = ?";
        return jdbcTemplate.query(sql, new Object[]{datasetId}, new BeanPropertyRowMapper<>(TagData.class));
    }

    public List<TagData> findByDatasetIdAndSampleIdAndTaggerId(String datasetId, String sampleId, Long taggerId) {
        String sql = "SELECT * FROM image_data WHERE dataset_id = ? AND sample_id = ? AND tagger_id = ?";
        return jdbcTemplate.query(sql, new Object[]{datasetId, sampleId, taggerId}, new BeanPropertyRowMapper<>(TagData.class));
    }
    public void save(TagData tagData) {
        String sql = "INSERT INTO image_data (dataset_id, sample_id, begin_pos, end_pos, tag, tagger_id) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(
                sql,
                tagData.getDatasetId(),
                tagData.getSampleId(),
                tagData.getBeginPos(),
                tagData.getEndPos(),
                tagData.getTag(),
                tagData.getTaggerId()
        );
    }
    public TagData findById(Long id) {
        String sql = "SELECT * FROM image_data WHERE id = ?";
        return jdbcTemplate.queryForObject(
                sql,
                new Object[]{id},
                new BeanPropertyRowMapper<>(TagData.class)
        );
    }
    public void delete(TagData tagData) {
        String sql = "DELETE FROM image_data WHERE id = ?";
        jdbcTemplate.update(sql, tagData.getId());
    }
}
