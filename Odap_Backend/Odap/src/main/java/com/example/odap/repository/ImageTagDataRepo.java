package com.example.odap.repository;
import com.example.odap.entity.Dataset;
import com.example.odap.entity.TagData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;


@Repository
public class ImageTagDataRepo {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final AtomicLong idCounter = new AtomicLong(50);
    private final RowMapper<TagData> tagDataRowMapper = (rs, rowNum) -> {
        TagData tagData = new TagData();
        tagData.setId(rs.getLong("id"));
        tagData.setDatasetId(rs.getString("dataset_id"));
        tagData.setSampleId(rs.getString("sample_id"));
        tagData.setBeginPos(rs.getString("begin_pos"));
        tagData.setEndPos(rs.getString("end_pos"));
        tagData.setTag(rs.getString("tag"));
        tagData.setTaggerId(rs.getLong("tagger_id"));
        return tagData;
    };

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
        long uniqueID = idCounter.incrementAndGet();
        tagData.setId(uniqueID);
        String sql = "INSERT INTO image_data (id,dataset_id, sample_id, begin_pos, end_pos, tag, tagger_id) " +
                "VALUES (?,?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(
                sql,
                tagData.getId(),
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
